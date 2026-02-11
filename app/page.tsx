export default async function Home() {
  
  return (
    <div className="p-5">

      <nav className="flex gap-2 text-sm">
        <a href="/test">Home</a>
        <a href="/menu">Menu</a>
        <a href="/test">Orders</a>
      </nav>

      <p className="text-[24px]">Flippy Pancakes - New Order</p>

      <form className="flex flex-col items-start gap-3 pt-4">
        <input className='bg-neutral-200 p-2 rounded-lg outline-none' type="text" placeholder="Customer Name"/>
        <input className='bg-neutral-200 p-2 rounded-lg outline-none' type="text" placeholder="Order Number"/>
        <button className='bg-neutral-200 p-2 px-3 rounded-lg' type="submit">Submit</button>
      </form>

    </div>
  );
}
