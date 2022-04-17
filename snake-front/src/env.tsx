export let snakeSocketUlr: string;
export let apiUrl: string;

if (process.env.NODE_ENV === 'production') {
  snakeSocketUlr = 'http://localhost:3004/classic-mode';
  apiUrl = 'http://localhost:3003'
} else {
  snakeSocketUlr = 'http://localhost:3004/classic-mode';
  apiUrl = 'http://localhost:3003'
}