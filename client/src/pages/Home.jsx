import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>InstaMeal 🍔</h1>

      <Link to="/cart">
        <button>Go to Cart</button>
      </Link>
    </div>
  );
}

export default Home;