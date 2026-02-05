import { addUser, retrieveUsers } from "@/lib/db";
import Image from "next/image";

export default async function Home() {
  const newId = addUser("Test");
  const users = retrieveUsers()

  
  return (
    <div>
      <p>Inserted ID: {newId.toString()}</p>
      {users.map((id) => (
        <p key={id}>{id.name}</p>
      ))}
    </div>
  );
}
