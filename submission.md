🔒 [security fix] Insecure Random Number Generation

🎯 **What:** Replaced the vulnerable Math.random() usage in the cybertext hook with a cryptographically secure random number generator using window.crypto.getRandomValues().

⚠️ **Risk:** Math.random() is predictable and unsuitable for generating random security tokens, potentially allowing attackers to predict the outcome and compromise the system's security.

🛡️ **Solution:** Switched to window.crypto.getRandomValues() which provides cryptographically strong random values, securely generating random text without vulnerability to prediction attacks.
