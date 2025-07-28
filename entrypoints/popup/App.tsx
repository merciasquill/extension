import ProfileBar from "./components/ProfileBar.js";

export default function App() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    storage.getItem("local:last-update").then((lastStorageUpdate) => {
      if (typeof lastStorageUpdate !== "number") {
        return setLastUpdated("Never");
      }

      setLastUpdated(timeAgo(lastStorageUpdate as number));
    });
  }, []);

  return (
    <>
      <main className="flex h-full w-full flex-col items-center justify-around bg-zinc-950 p-6">
        <ProfileBar className="mb-3" />
        <span className="xs font-medium text-zinc-500">
          Last Updated: <time>{lastUpdated}</time>
        </span>
      </main>
    </>
  );
}

function timeAgo(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}
