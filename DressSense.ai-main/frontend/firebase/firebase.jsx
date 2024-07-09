import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, onSnapshot, query, deleteDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject} from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { Image } from 'react-native';
 
const firebaseConfig = {
    apiKey: "AIzaSyBRmgOVZgvIJjDdaKxSerEIU26LTBAuLT4",
    authDomain: "swee-ab4bc.firebaseapp.com",
    projectId: "swee-ab4bc",
    storageBucket: "swee-ab4bc.appspot.com",
    messagingSenderId: "1061822090348",
    appId: "1:1061822090348:web:49ee1d35b725c0b412dc49",
    measurementId: "G-26S5HPWVX9",
  };

    const app = initializeApp(firebaseConfig);
    const storage = getStorage();
    const db = getFirestore();
    const clothesRef = collection(db, "clothes");

    export async function updateDescription(itemId, description){
      try {
          const itemRef = doc(db, 'clothes', itemId);
          await updateDoc(itemRef, {
              description: description // Replace with actual description
          });
          console.log('Description updated successfully');
      } catch (error) {
          console.error('Error updating description:', error);
          throw error;
      }
  } 

    export async function showClothes() {
      try {
          // Initialize an empty array to store clothes data
          const clothes = [];
  
          // Use onSnapshot to listen for changes and retrieve all documents
          const unsubscribe = onSnapshot(clothesRef, (querySnapshot) => {
              // Clear the existing clothes data
              clothes.splice(0, clothes.length);
  
              // Iterate through each document snapshot and push the data to the clothes array
              querySnapshot.forEach((doc) => {
                  clothes.push(doc.data());
              });
  
              //console.log("All clothes: ", clothes); // Log all clothes data
          }); 
  
          // Return the unsubscribe function in case it's needed outside
          return { unsubscribe, clothes };
      } catch (error) {
          console.error("Error fetching clothes data:", error);
          // Handle error if needed
          throw error; // Re-throw the error to propagate it further
      }
  }
     
  export const deleteClothes = async (clothId) => { 
    try {
      await deleteDoc(doc(db, "clothes", clothId.id));
      console.log('Cloth deleted successfully from Firestore');
      const docRef = ref(storage, `images/${clothId.filename}/`);
      await deleteObject(docRef);
    } catch (error) { 
      console.error('Error deleting cloth:', error);
      throw error; // Rethrow the error to handle it in the component
    }
  };

  export async function toRating(result){
    try{
        const response = await fetch(result);
        const blob = await response.blob();
        const filename = `${uuidv4()}.jpg`;
        const storageRef = ref(storage, `images/${filename}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);
        
        return new Promise((resolve,reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                console.error('Error uploading image:', error);
                reject(error);
            },
            async () => {
                console.log('Upload complete'); 
                url = await getDownloadURL(storageRef);
                console.log("url iss ", url)
                const imageFromPython = await sendRatingToPython(url);
                console.log("url = ", imageFromPython);
                resolve(imageFromPython);
            }
        );
    });

        
    }catch(e){
        console.log("error generating rating");
    }
  }
  export async function toMarketPlace(result) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(result);
            const blob = await response.blob();
            const filename = `${uuidv4()}.jpg`;
            const storageRef = ref(storage, `images/${filename}`);
            const uploadTask = uploadBytesResumable(storageRef, blob);
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    console.error('Error uploading image:', error);
                    reject(error); // Reject the promise if an error occurs
                },
                async () => {
                    console.log('Upload completed');
                    try {
                        const url = await getDownloadURL(storageRef);
                        console.log("url is ", url);
                        const imageFromPython = await sendMarketplaceImageToPython(url);
                        console.log("string = ", imageFromPython);
                        resolve(imageFromPython); // Resolve the promise with the result
                    } catch (error) {
                        console.error('Error getting download URL or sending image toPython:', error);
                        reject(error); // Reject the promise if an error occurs
                    }
                }
            );
        } catch (error) {
            console.log("error generating toMarketPlace", error);
            reject(error); // Reject the promise if an error occurs
        }
    });
}



  export async function toFirebase(result) {
    try {
        // Convert the local file URI to Blob
        const response = await fetch(result);
        const blob = await response.blob();
        const filename = `${uuidv4()}.jpg`;
        const storageRef = ref(storage, `images/${filename}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                console.error('Error uploading image:', error);
            },
            async () => {
                console.log('Upload complete'); 
                const url = await getDownloadURL(storageRef);
                console.log('Download URL:', url);

                // Send URL to Python backend for description generation
                const description = await sendImageToPython(url);
                console.log("description is: ", description);
                // Store the URL and generated description in Firestore
                try {
                    const docRef = await addDoc(collection(db, "clothes"), {
                        'description': description, // Use the received description
                        'downloadUrl': url,
                        'filename': filename
                    });
                    await updateDoc(docRef, { 'id': docRef.id });
                    console.log("Document written with ID: ", docRef.id);
                } catch (e) {
                    console.error("Error adding document: ", e);
                }
            }
        );
    } catch (error) {
        console.error("Error uploading image: ", error);
    }
}

// Function to send the image URL to the Python backend and get the description
async function sendImageToPython(imageUrl) {
    try {
        const response = await fetch('http://10.91.173.254:5001/addtocloset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_url: imageUrl }),
        });
        const data = await response.json();
        return data.description;
    } catch (error) {
        console.error('Error sending image to Python backend:', error);
        throw error;
    }
}
async function sendRatingToPython(imageUrl) {
    try {
        const response = await fetch('http://10.91.173.254:5001/outfitsrater', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_url: imageUrl }),
        });
        const data = await response.json();
        return data.description;
    } catch (error) {
        console.error('Error sending image to Python backend:', error);
        throw error;
    }
}

async function sendMarketplaceImageToPython(imageUrl){
    try {
        const response = await fetch('http://10.91.173.254:5001/marketplace', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_url: imageUrl }),
        });
        const data = await response.json();
        console.log("receieved: ", data.description);
        return data.description;
    } catch (error) {
        console.error('Error sending image to Python backend:', error);
        throw error;
    }    
}

  export default app;