# MongoDB to Firebase Migration Guide

This document provides instructions for migrating the application from MongoDB to Firebase.

## Prerequisites

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Firebase Authentication
4. Enable Firebase Storage
5. Get your Firebase configuration (API keys, etc.)

## Step 1: Update Environment Variables

1. Update your `.env.local` file with your Firebase configuration values:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

2. Keep your existing MongoDB URI and Cloudinary configuration in the `.env.local` file as they will be needed during the migration process.

## Step 2: Install Firebase Dependencies

```bash
npm install firebase
```

## Step 3: Migrate Data from MongoDB to Firebase

1. Update the Firebase configuration in `scripts/migrate-to-firebase.js` with your Firebase project details
2. Run the migration script:

```bash
npm run migrate-to-firebase
```

## Step 4: Switch to Firebase API Implementations

Run the script to switch to Firebase implementations:

```bash
npm run use-firebase
```

This script will:
1. Back up your original MongoDB API files
2. Replace them with the Firebase implementations

If you need to switch back to MongoDB for any reason, you can run:

```bash
npm run use-mongodb
```

## Step 5: Update Authentication (if needed)

If you're using authentication in your application, you'll need to update your authentication logic to use Firebase Authentication instead of your current solution.

1. Update your login/register forms to use Firebase Authentication
2. Update your authentication context to use Firebase Authentication

## Step 6: Test the Application

1. Start the development server:

```bash
npm run dev
```

2. Test all functionality to ensure it works with Firebase:
   - User registration and login
   - Application submission
   - Document uploads
   - Admin dashboard

## Step 7: Clean Up MongoDB Files (Optional)

Once you've confirmed that everything is working correctly with Firebase, you can remove all MongoDB-related files:

```bash
npm run cleanup-mongodb
```

This script will:
1. Remove all MongoDB-specific files
2. Remove the mongoose dependency from package.json
3. Remove MongoDB URI from .env.local
4. Remove the .firebase suffix from API files

After running this script, your project will be fully migrated to Firebase with no MongoDB dependencies.

## Troubleshooting

### Firebase Rules

Make sure your Firestore and Storage security rules allow the operations your application needs to perform. Here are some example rules to get started:

#### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // For public access during development
    // Remove this in production
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to authenticated users
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }

    // For public access during development
    // Remove this in production
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### Common Issues

1. **CORS Issues**: If you encounter CORS issues with Firebase Storage, make sure you've configured CORS for your Storage bucket.

2. **Authentication Issues**: If you're having trouble with authentication, check that you've enabled the Email/Password provider in the Firebase Authentication console.

3. **Missing Data**: If data appears to be missing after migration, check the migration script logs for any errors during the migration process.

4. **API Errors**: If you encounter errors in the API endpoints, check the server logs for detailed error messages.

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
