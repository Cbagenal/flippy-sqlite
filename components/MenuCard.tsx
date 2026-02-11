import Image from "next/image";

interface MenuItem {
  id: string | number;
  name: string;
  description: string;
  price: string;
  imageSrc: string;
}

interface MenuCardProps {
  categoryTitle: string;
  items: MenuItem[];
}

const MenuItem = ({ name, description, price, imageSrc }: Omit<MenuItem, 'id'>) => (
  <div className="flex flex-row mt-4 mx-4 h-[100px] bg-[#EEDEC5] rounded-md overflow-hidden">
    <div className="flex-1 p-2">
      <p className="text-md font-medium">{name}</p>
      <p className="text-xs opacity-70 line-clamp-2">{description}</p>
      <p className="mt-1 text-md font-semibold">{price}</p>
    </div>
    <div className="flex justify-end items-center pr-[5px]">
      <Image className="rounded-sm object-cover" src={imageSrc} width={90} height={90} alt={name} />
    </div>
  </div>
);

export default function MenuCard({ categoryTitle, items }: MenuCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm w-full max-w-md pb-6 overflow-hidden">
      <p className="mt-4 ml-4 text-xl font-medium">{categoryTitle}</p>
      <hr className="mt-2 mx-4 h-[2px] bg-black/10 border-0 rounded-full" />
      
      <div className="flex flex-col">
        {items.map((item) => (
          <MenuItem 
            key={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            imageSrc={item.imageSrc}
          />
        ))}
      </div>
    </div>
  );
}