import React from 'react'
import Search from './components/Search'
import { useState, useEffect } from 'react'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { useDebounce } from "react-use"
import { updateSearchCount } from './appwrite.js'
import { getTrendingMovies } from './appwrite.js'

const API_BASE_URL = "https://api.themoviedb.org/3"

const API_KEY = import.meta.env.VITE_TMDB_API_KEY


const API_OPTIONS = {
  method:'GET',
  headers:{
    accept:'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {

  const [searchTerm, setSearchTerm] = useState('')

  const [errorMessage, setErrorMessage]= useState('')

  const [moiveList, setMoiveList] = useState([])

  const [isLoading, setIsLoading] = useState(false)


  const [debouceSearchTerm, setDebouceSearchTerm] = useState('')


  const [trendingMovies, setTrendingMovies] = useState([])

  // after every 500 ms set the search term value in the debouceSearchTerm

  // Debouce is a technique where we wait for a certain amount of time before executing a function
  // In this case we wait for 500ms before executing the function

  useDebounce(()=>
    setDebouceSearchTerm(searchTerm), 1000, [searchTerm]
  )


  // a method for fetching the movies 

  const fetchMovies = async (query='')=>{

    // turn on the loading state 

    setIsLoading(true)
    setErrorMessage('')

    updateSearchCount()

    try {
      
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` 
      : `${API_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`

      const response = await fetch(endpoint, API_OPTIONS)

     if(!response.ok){
      throw new Error('Network response was not ok')
     }

     const data = await response.json()
     
     if(data.Response === 'False'){
      setErrorMessage(data.Error || 'Error fetching movies. Please try again later')
      setMoiveList([])
      return
     }


    // movies fetched successfully so 
    setMoiveList(data.results || [])


    // update the search count

    if(query && data.results.length > 0){

      await updateSearchCount(query, data.results[0])

    }
    

    } catch (error) {
        console.log(`Error fetching movies ${error}`);
        setErrorMessage(`Error fetching movies. Please try again later`)      
    } finally {
      setIsLoading(false)
    }
  }


  // a method for fetching the top trending movies

   const fetchTrendingMovies = async ()=>{
      try {

        const resposne = await getTrendingMovies()

        setTrendingMovies(resposne)

      } catch (error) {
       console.log(`Error in fetching the trending movies`)
      }
  }


  useEffect(() => {

    fetchMovies(debouceSearchTerm)
   
  }, [debouceSearchTerm])
  
  
  useEffect(() => {
    
    fetchTrendingMovies()

  }, [])
  


  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>

          <img src="../public/hero-img.png" alt="Hero Banner" />
          <h1>
            Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        {
          trendingMovies.length > 0 && (
            
            <section className='trending'>

              <h2>Trending Movies</h2>

              <ul>
                {
                  trendingMovies.map((movie, index)=>(
                    <li key={movie.id}>
                      <p>{index+1}</p>
                      <img src={movie.poster_url} alt={movie.title} />
                    </li>
                  ))
                }
              </ul>

            </section>
          ) 
        }


        <section className='all-movies'>
          <h2> All Movies</h2>

        {/* Here we will show the list of movies */}

        {
          isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {
                moiveList.map((movie)=>(
                  <MovieCard key={movie.id}  movie={movie}  />
                ))
              }
            </ul>
          )
        }

        </section>

      </div>
    </main>
  )
}

export default App

