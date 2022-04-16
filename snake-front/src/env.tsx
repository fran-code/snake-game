export let snakeSocketUlr: string;
export let apiUrl: string;

if (process.env.NODE_ENV === 'production') {
  snakeSocketUlr = 'https://socfifa.sauravmh.com/classic-mode';
  apiUrl = 'https://apififa.sauravmh.com'
} else {
  snakeSocketUlr = 'http://localhost:3004/classic-mode';
  apiUrl = 'http://localhost:3003'
}