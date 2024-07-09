import { request, gql } from 'graphql-request'

const MASTER_URL="https://api-us-east-1-shared-usea1-02.hygraph.com/v2/clqpdgtas0qi901t6aj3ygmrg/master"

const getSlider=async()=>{
    const query = gql`
    query GetSlider {
        sliders {
          id
          name
          image {
            url
          }
        }
      }
      
  `
 const result= await request(MASTER_URL, query);
 return result;
}


export default{
    getSlider,
}
