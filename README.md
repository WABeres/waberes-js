# WABeres SDK (Javascript/Typescript)
SDK for interacting with WABeres API for convenience

## How to use? (Local Development Setup)

Since this SDK is not published yet on npm, so here is how can you use this SDK

1. Clone this repo
```bash
git clone https://github.com/WABeres/waberes-js.git
cd waberes-js
```

2. Run this command
```bash
npm run setup
```
That command will run `npm install`, `npm run build` and `npm link` under the hood

3. Navigate to your project where you want to use this SDK and then run this command
```bash
npm link waberes-js
```
_Always remember to run `npm link waberes-js` at the end of every npm install command, otherwise it will disappear from `node_modules`_

### Use it on your project

```javascript
import { createWABeresClient } from "waberes-js";

const client = createWABeresClient({
    apiKey: "your_api_key",
    secretKey: "your_api_key"
});
```


And that's it...you can explore the methods available<br>

### On every SDK update, run this command on the SDK directory
```bash
cd waberes-js
git pull
npm run build
```
No need to redo `npm link`.<br>

## How to test?

For running each test files
```bash
npm run test
```

For coverage test
```bash
npm run test:coverage
```

Enjoy :)