const messages = [
    "Workers must login via the Worker Login page.",
    "Please verify your email before logging in. Check your inbox for the verification link.",
    "Please verify your mobile number before logging in.",
    "Not authorized as worker",
    "Account is not active. Contact your admin.",
    "Access denied. Your account is suspended.",
    "Access denied. Your account is unverified.",
    "Access denied. Your account is pending."
];

for (const msg of messages) {
    const obj = { message: msg };
    const str = JSON.stringify(obj);
    console.log(`Length: ${Buffer.byteLength(str, 'utf8')} | \`${str}\``);
}
