from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a new context with video recording
        context = browser.new_context(record_video_dir="/home/jules/verification/video")
        page = context.new_page()

        try:
            # Navigate to the app (assuming it runs on port 5173 from memory)
            page.goto("http://localhost:5173")
            page.wait_for_timeout(1000)

            # Check if we are on WelcomePage and need to enter a name
            if page.get_by_text("Welcome to Vellor").is_visible():
                page.get_by_placeholder("Enter your name").fill("Bolt")
                page.get_by_role("button", name="Get Started").click()
                page.wait_for_timeout(1000)

            # Verification of DashboardPage
            # We want to see the charts rendering which depends on the logic we changed
            expect(page.get_by_text("Welcome back, Bolt")).to_be_visible()

            # Wait for charts to potentially animate
            page.wait_for_timeout(2000)

            # Take screenshot
            os.makedirs("/home/jules/verification", exist_ok=True)
            page.screenshot(path="/home/jules/verification/verification.png")
            print("Screenshot saved to /home/jules/verification/verification.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    run()
