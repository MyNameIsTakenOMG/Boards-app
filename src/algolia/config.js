import algoliasearch  from 'algoliasearch'


// const searchClient = algoliasearch('AUEXRGJOIY','16a152a7bd17912fec34be2e6219eae5')
const algoliaClient = algoliasearch('AUEXRGJOIY','16a152a7bd17912fec34be2e6219eae5')
const algoliaClient2 = algoliasearch('L208V37A53','af29cbda063aa890f4881c851b253b91')
//  stop the initial request to Algolia's server with an empty query string
const searchClient = {
    ...algoliaClient,
    search(requests){
        if(requests.every(({params})=>!params.query)){
            return Promise.resolve({
                results: requests.map(() => ({
                  hits: [],
                  nbHits: 0,
                  nbPages: 0,
                  page: 0,
                  processingTimeMS: 0,
                })),
              });
        }
        return algoliaClient.search(requests)
    }
}
const searchClient2 = {
    ...algoliaClient2,
    search(requests){
        if(requests.every(({params})=>!params.query)){
            return Promise.resolve({
                results: requests.map(() => ({
                  hits: [],
                  nbHits: 0,
                  nbPages: 0,
                  page: 0,
                  processingTimeMS: 0,
                })),
              });
        }
        return algoliaClient2.search(requests)
    }
}

export {searchClient, searchClient2}