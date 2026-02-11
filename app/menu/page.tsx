import MenuCard from "@/components/MenuCard";

const PANCAKE_DATA = [
  {
    id: 1,
    name: "Buttermilk Stack",
    description: "Three fluffy buttermilk pancakes served with butter and maple syrup",
    price: "£5.99",
    imageSrc: "/chocolate-pancakes.jpg",
  },
  {
    id: 2,
    name: "Strawberry Dream",
    description: "Fresh strawberries and whipped cream atop our signature stack",
    price: "£6.49",
    imageSrc: "/strawberry-pancakes.jpg",
  },
  {
    id: 3,
    name: "Lemon & Sugar",
    description: "A zesty classic served with fresh lemon wedges and caster sugar",
    price: "£5.49",
    imageSrc: "/lemon-pancakes.jpg",
  },
];

const DRINKS_DATA = [
  {
    id: 1,
    name: "test",
    description: 'test',
    price: 'test',
    imageSrc: "/lemon-pancakes.jpg"
  },
]

export default function Page() {
  return (
    <div className="flex flex-col md:flex-row gap-4 min-h-screen items-center md:items-start md:justify-center bg-[#EEDEC5] px-2 pt-4">
      <MenuCard categoryTitle="Classic Pancakes" items={PANCAKE_DATA} />
      <MenuCard categoryTitle="Drinks" items={DRINKS_DATA} />
    </div>
  );
}