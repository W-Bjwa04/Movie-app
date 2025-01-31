import { Client, Databases, ID, Query } from "appwrite";

// Load environment variables
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(`https://cloud.appwrite.io/v1`)
    .setProject(PROJECT_ID);

const database = new Databases(client);

/**
 * Updates the search count for a given search term in the Appwrite database.
 * If the search term exists, increments the count. Otherwise, creates a new document.
*/

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        // Step 1: Check if the search term already exists
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm)
        ]);

        // Step 2: If the search term exists, update the count
        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            });
        }
        // Step 3: If the search term does not exist, create a new document
        else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error("Error updating search count:", error);
        throw error; // Optionally rethrow the error
    }
};


// Get the top searched movies 

export const getTrendingMovies = async ()=>{
    try {
        
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5), 
            Query.orderDesc('count')
        ])

        return result.documents


    } catch (error) {
        throw new Error(`Failed to fetch the top trending movies: ${error.message}`)
    }   
}