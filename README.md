# caseable GmbH Catalog Javascript API

This is the Javascript library to access the products catalog from browser and node.

## Usage

Check out the [documentation](https://rawgit.com/caseable/caseable-catalog-js/master/docs/)
to use the library in your app.

## Building from sources

1. Make sure `npm` is installed on your system.
2. Clone the repository somewhere (say `<repo-directory>`).
3. Optionally make sure the tests pass:

    `cd <repo-directory> && npm run test`
4. Create the distribution package and documentation:

    `cd <repo-directory> && npm run build:catalog && npm run build:docs`
    

## UI Part

To build the ui library run the following command:

    `npm run build:ui`
    
To run demo application:
1. run the following command:

    `npm run dev`
2. open localhost:5000 in the browser
