// Префиксует внутренние абсолютные ссылки base-путём (нужно для GitHub Pages,
// где сайт живёт по /<repo>/, а не в корне домена). На проде base = "/",
// поэтому в обычной сборке функция ничего не меняет.
export function url(path: string): string {
  const base = import.meta.env.BASE_URL;
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${cleanBase}${path}`;
}
