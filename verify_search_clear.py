from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:4173")
        time.sleep(1)

        # Take a screenshot
        page.screenshot(path="marketing.png")

        # Click on Features link just to see if we can interact
        features_link = page.locator('button:has-text("Features")').first
        if features_link.is_visible():
            features_link.click()
            time.sleep(1)
            page.screenshot(path="features_click.png")

        print("Done")
        browser.close()

if __name__ == "__main__":
    run()
