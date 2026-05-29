# Google Play Data Safety - RoadShift: Traffic Puzzle

Use this document to complete the Data Safety section in Google Play Console.

---

## Data Collection Summary

**Does your app collect or share any of the required user data types?**
Yes - through Google AdMob (third-party advertising SDK).

**Is all of the user data collected by your app encrypted in transit?**
Yes - all ad network communications use HTTPS.

**Do you provide a way for users to request that their data is deleted?**
Yes - via app uninstall or Reset All Progress in Settings (for local data).

---

## Data Types Collected

### App Activity
- **App interactions**: Collected by Google AdMob for ad targeting and measurement. Purpose: Advertising or marketing. Shared with third parties (Google).

### Device or Other IDs
- **Device or other IDs** (Android Advertising ID): Collected by Google AdMob for ad targeting and measurement. Purpose: Advertising or marketing. Shared with third parties (Google).

---

## Data Types NOT Collected

RoadShift does NOT collect or share:
- Personal info (name, email, address, phone, account credentials)
- Location data (precise or approximate)
- Photos or videos
- Audio files
- Contacts
- Messages (emails, SMS)
- Health or fitness data
- Financial info
- Web browsing history
- Installed apps (beyond what the Google Play Services framework may read)

---

## Local Data (Not Collected by Old Alex Hub)

The following is stored locally on the device only and is NOT transmitted to Old Alex Hub:
- Game progress, scores, and stars
- Achievement status
- Settings preferences
- Ad frequency counters and timestamps

---

## Privacy Policy URL

Include your hosted or in-app privacy policy URL. The full policy is in `PRIVACYPOLICY.md`.

---

## Notes for Completing the Form

- Select "Data collected" and indicate Google AdMob collects Device IDs and App Activity
- Mark the data as used for advertising purposes
- Indicate that the data is shared with Google (AdMob)
- Mark HTTPS encryption as yes
- For the privacy policy link, use your published privacy policy URL
- Indicate that users can request deletion via in-app Reset and uninstall

If Google AdMob's data practices change, review the [Google AdMob Data Safety guidance](https://support.google.com/admob/answer/9012903) to update this section accordingly.
