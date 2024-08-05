# Rainy Window for [Lively Wallpaper](https://github.com/rocksdanister/lively)

Rainy window wallpaper using experimental WebGL rain drop effects by Lucas Bebber.

[Article on Codrops](http://tympanus.net/codrops/?p=25417)

[Demo](http://tympanus.net/Development/RainEffect/)

## Setup

1. Install Node.js and Yarn

    * Download and install Node.js from [nodejs.org](https://nodejs.org/).
    * Install Yarn globally using npm: `npm install -g yarn`

2. Install dependencies

    * Open a terminal and navigate to the root directory of your project.
    * Use Yarn to install the dependencies listed in package.json: `yarn install`

3. Run Gulp to compile JS

    * To build the main JS file, run the `gulp` command from the root directory of your project.
    * This will concatenate and minify the JavaScript files from the `src` directory and output the result to the `build/js` directory.
    * It also zips the contents of the build directory into build.zip for the purpose of importing into [Lively Wallpaper](https://github.com/rocksdanister/lively). Unfortunately none of the [Lively Wallpaper controls](https://github.com/rocksdanister/lively/wiki/Web-Guide-IV-:-Interaction) are currently working due to `livelyPropertyListener()` just outright not working.
  
4. To preview, view index.html on a local server

    * Set up a localhost server in the build directory and run index.html.
    * Opening index.html by itself won't work.

## License

Integrate or build upon it for free in your personal or commercial projects. Don't republish, redistribute or sell "as-is". 

Read more here: [License](https://opensource.org/license/mit)
