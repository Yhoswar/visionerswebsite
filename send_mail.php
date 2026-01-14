<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

header('Content-Type: application/json');

// Load Configuration and Library
if (!file_exists('config.php')) {
    echo json_encode(['success' => false, 'message' => 'Server configuration missing (config.php).']);
    exit;
}
require_once 'config.php';

// Manual Require of PHPMailer (No Composer)
require_once 'vendor/phpmailer/src/Exception.php';
require_once 'vendor/phpmailer/src/PHPMailer.php';
require_once 'vendor/phpmailer/src/SMTP.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Fallback to $_POST if JSON is empty (for standard form submits if needed, though we use JS fetch)
if (!$input) {
    $input = $_POST;
}

// Sanitize and Validate
$name = trim(filter_var($input['name'] ?? '', FILTER_SANITIZE_STRING));
$email = trim(filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL));
$message = trim(filter_var($input['message'] ?? '', FILTER_SANITIZE_STRING));

if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all fields.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = SMTP_SECURE;
    $mail->Port       = SMTP_PORT;

    // Recipients
    $mail->setFrom(MAIL_FROM_EMAIL, MAIL_FROM_NAME); // Sender (must be authenticated user usually)
    $mail->addAddress(MAIL_TO_EMAIL, MAIL_TO_NAME);  // Add a recipient
    $mail->addReplyTo($email, $name);                // Reply to the user who filled the form

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'New Contact Message from ' . $name;

    // HTML Email Body
    $mail->Body    = "
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> {$name}</p>
        <p><strong>Email:</strong> {$email}</p>
        <p><strong>Message:</strong></p>
        <blockquote style='background: #f9f9f9; padding: 10px; border-left: 3px solid #ccc;'>
            " . nl2br($message) . "
        </blockquote>
        <br>
        <p><small>Sent from Visioners Website Contact Form</small></p>
    ";

    // Plain text alternative
    $mail->AltBody = "Name: {$name}\nEmail: {$email}\n\nMessage:\n{$message}";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}
