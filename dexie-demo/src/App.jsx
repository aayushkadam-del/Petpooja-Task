import React, { useEffect, useState } from 'react'
import db from '../src/db/db'
const App = () => {
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [users,setUsers] = useState([])

  useEffect(()=>{
    fetchUsers()
  })
  const fetchUsers = async () => {
    const allUsers = await db.users.toArray();
    setUsers(allUsers || []);
  };

 const handleSubmit = async (e) => {
  
    e.preventDefault();
    if (!name || !email) return;

    await db.users.add({ name, email });
    setName("");
    setEmail("");
    fetchUsers();
  };
  function setCookie(name, value, days = 1) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}
setCookie("email", email);
setCookie("username", name);

  return (
    <div
  style={{
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  <div style={{ width: 320, padding: 20 }}>
    <h2 style={{ textAlign: "center" }}>Dexie User Store</h2>

    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button>Save</button>
    </form>

    <ul style={{ marginTop: 20 }}>
      {users.map((user) => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  </div>
</div>


  )
}

export default App