import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  APPLICATIONS: 'applications',
  CONTACTS: 'contacts'
};

// Generic CRUD operations
export async function getDocument(collectionName, id) {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

export async function getDocuments(collectionName, constraints = []) {
  try {
    let q = collection(db, collectionName);

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const documents = [];

    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return documents;
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

export async function addDocument(collectionName, data) {
  try {
    // Add timestamp
    const dataWithTimestamp = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, collectionName), dataWithTimestamp);
    return { id: docRef.id, ...dataWithTimestamp };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

export async function updateDocument(collectionName, id, data) {
  try {
    const docRef = doc(db, collectionName, id);

    // Add updated timestamp
    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, dataWithTimestamp);

    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    }

    return { id, ...dataWithTimestamp };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

export async function deleteDocument(collectionName, id) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

// Application-specific functions
export async function getUserApplications(userId) {
  try {
    const applicationsRef = collection(db, "applications");
    let q;
    if (userId) {
      // User ke applications
      q = query(applicationsRef, where("userId", "==", userId));
    } else {
      // Admin ke liye saare applications
      q = query(applicationsRef);
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user applications:", error);
    throw error;
  }
}

export async function getApplicationById(id, userId = null) {
  try {
    const application = await getDocument(COLLECTIONS.APPLICATIONS, id);

    // If userId is provided, check if the application belongs to the user
    if (userId && application && application.userId !== userId) {
      return null;
    }

    return application;
  } catch (error) {
    console.error('Error getting application by ID:', error);
    throw error;
  }
}

export async function createApplication(applicationData) {
  try {
    // Format the data to match our schema
    const formattedData = {
      ...applicationData,
      submissionDate: serverTimestamp(),
      submissionDateISO: new Date().toISOString(), // Add ISO string for easier client-side handling
      currentStatus: 'Document Submitted',
      statusHistory: [
        {
          status: 'Document Submitted',
          date: new Date().toISOString(),
          note: 'Application submitted successfully',
          tentativeDate: null
        }
      ]
    };

    return await addDocument(COLLECTIONS.APPLICATIONS, formattedData);
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
}

export async function updateApplicationStatus(id, status, note = null, tentativeDate = null, requiredDocuments = []) {
  try {
    const application = await getDocument(COLLECTIONS.APPLICATIONS, id);

    if (!application) {
      throw new Error('Application not found');
    }

    // Always add a new status entry if there's a note, even if the status hasn't changed
    // This allows updating the process through notes without changing the status
    if (application.currentStatus === status && !requiredDocuments.length && !note) {
      return application;
    }

    // Create new status history entry
    const newStatusEntry = {
      status,
      date: new Date().toISOString(),
      note: note || `Status updated to ${status}`,
      tentativeDate: tentativeDate || null
    };

    // Add required documents if needed
    if (status === 'Additional Documents Needed' && requiredDocuments.length > 0) {
      newStatusEntry.requiredDocuments = requiredDocuments;
    }

    // Get existing status history
    const statusHistory = application.statusHistory || [];

    // Update the application
    const updatedData = {
      currentStatus: status,
      statusHistory: [...statusHistory, newStatusEntry]
    };

    return await updateDocument(COLLECTIONS.APPLICATIONS, id, updatedData);
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
}

export async function addDocumentToApplication(applicationId, documentData) {
  try {
    const application = await getDocument(COLLECTIONS.APPLICATIONS, applicationId);

    if (!application) {
      throw new Error('Application not found');
    }

    // Add the document to the application
    const documents = application.documents || [];
    const updatedDocuments = [...documents, {
      ...documentData,
      uploadDate: new Date().toISOString()
    }];

    // Add a status history entry for the document upload
    const statusHistory = application.statusHistory || [];

    // Only add a status entry if it's a significant status change, not just a document upload
    // We'll handle status changes separately below
    const documentUploadNote = `${documentData.type} uploaded successfully`;

    // Check if all required documents have been uploaded
    let currentStatus = application.currentStatus;
    const latestStatusWithDocs = [...statusHistory]
      .filter(entry => entry.status === 'Additional Documents Needed' && entry.requiredDocuments && entry.requiredDocuments.length > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    // If we have a list of required documents
    if (latestStatusWithDocs?.requiredDocuments && latestStatusWithDocs.requiredDocuments.length > 0) {
      // Get all document types that have been uploaded
      const uploadedDocTypes = [...updatedDocuments].map(doc => doc.type);

      // Check if all required documents have been uploaded
      const allDocsUploaded = latestStatusWithDocs.requiredDocuments.every(
        reqDoc => uploadedDocTypes.includes(reqDoc)
      );

      // If all documents have been uploaded, update the status to Additional Documents Submitted
      // This follows the new status flow: Document Submitted -> Additional Documents Needed -> Additional Documents Submitted -> Documents Verified -> Visa Application Submitted
      if (allDocsUploaded) {
        currentStatus = 'Additional Documents Submitted';
        statusHistory.push({
          status: 'Additional Documents Submitted',
          date: new Date().toISOString(),
          note: 'All required documents have been uploaded'
        });
      }
    } else {
      // Legacy behavior - if there's no specific list, just update the status to Additional Documents Submitted
      currentStatus = 'Additional Documents Submitted';
    }

    // Only add a status history entry if the status has changed
    let updatedStatusHistory = statusHistory;

    // If the status has changed from the current one, add a new status entry
    if (currentStatus !== application.currentStatus) {
      updatedStatusHistory = [...statusHistory, {
        status: currentStatus,
        date: new Date().toISOString(),
        note: 'Status updated based on document uploads'
      }];
    }

    // Update the application
    const updatedData = {
      documents: updatedDocuments,
      statusHistory: updatedStatusHistory,
      currentStatus
    };

    return await updateDocument(COLLECTIONS.APPLICATIONS, applicationId, updatedData);
  } catch (error) {
    console.error('Error adding document to application:', error);
    throw error;
  }
}

// User-specific functions
export async function getUserByEmail(email) {
  try {
    const constraints = [where('email', '==', email)];
    const users = await getDocuments(COLLECTIONS.USERS, constraints);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function getUserById(id) {
  try {
    return await getDocument(COLLECTIONS.USERS, id);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

export async function updateUser(id, userData) {
  try {
    return await updateDocument(COLLECTIONS.USERS, id, userData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function getUsersByRole(role) {
  try {
    const constraints = [where('role', '==', role)];
    return await getDocuments(COLLECTIONS.USERS, constraints);
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
}

export async function createUser(userData) {
  try {
    return await addDocument(COLLECTIONS.USERS, userData);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Contact-specific functions
export async function createContact(contactData) {
  try {
    return await addDocument(COLLECTIONS.CONTACTS, contactData);
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
}

export async function getAllContacts() {
  try {
    console.log('Getting all contacts');

    // Skip the index attempt and directly use the simple query
    // This avoids the index error completely
    const contacts = await getDocuments(COLLECTIONS.CONTACTS);
    console.log(`Found ${contacts.length} contacts`);

    // Sort manually in memory with improved handling of different date formats
    return contacts.sort((a, b) => {
      // Handle Firestore timestamps (objects with seconds and nanoseconds)
      if (a.createdAt && b.createdAt) {
        if (a.createdAt.seconds && b.createdAt.seconds) {
          return b.createdAt.seconds - a.createdAt.seconds;
        }

        // Handle date strings
        try {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } catch (e) {
          console.warn('Error comparing dates:', e);
        }
      }

      // If no dates are available or comparison fails, maintain original order
      return 0;
    });
  } catch (error) {
    console.error('Error getting all contacts:', error);
    throw error;
  }
}

export { COLLECTIONS };
