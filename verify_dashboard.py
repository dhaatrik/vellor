from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a new context with video recording
        context = browser.new_context(record_video_dir="/home/jules/verification/video")
        page = context.new_page()

        try:
            # Navigate to the app (assuming it runs on port 4173 from memory)
            page.goto("http://localhost:4173")
            page.wait_for_timeout(1000)

            # Check if we are on the Set Master Password page
            if page.get_by_text("Set Master Password").is_visible():
                page.get_by_placeholder("Master Password").fill("testpassword")
                page.get_by_role("button", name="Set Password & Start").click()
                page.wait_for_timeout(1000)

            # Check for Recovery Key
            if page.get_by_role("button", name="I have safely stored my recovery key").is_visible():
                page.get_by_role("button", name="I have safely stored my recovery key").click()
                page.wait_for_timeout(1000)

            # Check if we are on WelcomePage and need to enter a name
            if page.get_by_text("Welcome to Vellor").is_visible():
                page.get_by_placeholder("e.g., Rahul Sharma").fill("Bolt")
                page.get_by_role("button", name="Get Started").click()
                page.wait_for_timeout(1000)

            # Verification of DashboardPage
            expect(page.get_by_text("Welcome back, Bolt")).to_be_visible()

            # Click on 'Students' tab (now aria-label enabled)
            tab_students = page.get_by_role("tab", name="Students")
            tab_students.click()
            page.wait_for_timeout(1000)

            # Click on 'Income' tab
            tab_income = page.get_by_role("tab", name="Income")
            tab_income.click()

            # Wait for charts to potentially animate
            page.wait_for_timeout(1000)

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