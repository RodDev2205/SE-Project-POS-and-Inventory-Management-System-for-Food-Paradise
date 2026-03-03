const [categories, setCategories] = useState([]);

useEffect(() => {
  fetchCategories();
  fetchProducts();
}, []);

const fetchCategories = async () => {
  try {
    const res = await fetch("https://deployment-backend-repo-production.up.railway.app/api/categories");
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    setCategories(data);
  } catch (err) {
    console.error(err);
  }
};
