# Material Walkthrough
**WARNING:** This is a **UNSTABLE** branch. Help us to develop a new Material Walkthrough based on ES6!

A material tour, based on Google's Inbox (Fullscreen Tooltip Message), for your site, enhancing the UX.
[See the demo here!](https://essetwide.github.io/material-walkthrough/)

Nov, 2014 - "[User Experience Design Concepts from Google Inbox](http://spyrestudios.com/ux-design-from-google-inbox/)" by Jake Rocheleau

## Features
* Material Design - Have a Material look, based on the tour presented by Google Inbox.
* Customizable - Change the content and colors easily.
* Responsive - Resize the screen and continue enjoying your Walkthrough.
* Simple - With a few lines of code you will got a Walkthrough.
* Compatible - Google Chrome 52.0; Firefox 48.0.2; Microsoft Edge 38.14393.0.0.
* Clean - No more jQuery as dependency!
* Made with love - Few nights without studying to develop this plugin with much love. 

## Getting Startet
### Using through NPM

#### 1. Installing
First, you just need to install the plugin from the NPM Registry.
```bash
npm install @essetwide/material-walkthrough@beta
```

#### 2. Importing
Import the script by your language. It not need any dependency!
#### ES6's `import` Syntax
If your module bundler supports `import` statements.
```js
import MaterialWalkthrough from '@essetwide/material-walkthrough';
```

#### CommonJS's `require` Syntax
If your project use `require` pattern.
```js
const MaterialWalkthrough = require('@essetwide/material-walkthrough');
```

### Using without NPM

#### 1. Downloading the ZIP from source
If your project use plain JS, then you can download the ZIP from master [here](https://github.com/essetwide/material-walkthrough/archive/master.zip) and extract it in your project.

#### 2. Setup your Code
Insert the js source in your html code and use the plugin through the `MaterialWalkthrough` global.
```html
<body>
  .
  .
  .
  <!-- Material Walkthrough plugin -->
  <script src="path/to/material-walkthrough/material-walkthrough.min.js"></script>
</body>
```

### Usage
#### 1. Setup your markup
You don't need any special markup. All you need is add something to identify your HTML element - an id or a class, by example.
```html
<a id="step1">Try it Now!</a>
```
#### 2. Call the component!
Just call the main method passing to it an array of your targets - we call it of `WalkPoints`.
```js
MaterialWalkthrough.walk([
  {
    target: '#step1',
    content: 'My First Walkthrough!',
    acceptText: 'YEAH!'
  }
]);
```
# License
  Copyright 2018 Esset Software LTD.
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this files except in compliance with the License.
  You may obtain a copy of the License at
 
  http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  
# Thanks To
* Thanks to [@galambalazs](https://github.com/galambalazs) for the Lock Scroll code. 
