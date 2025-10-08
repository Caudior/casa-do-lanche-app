import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const dummyMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "X-Burger Clássico",
    description: "Hambúrguer de carne, queijo, alface, tomate e maionese no pão de brioche.",
    price: 25.00,
    imageUrl: "https://via.placeholder.com/150/FF5733/FFFFFF?text=X-Burger",
  },
  {
    id: "2",
    name: "X-Salada Especial",
    description: "Hambúrguer de carne, queijo, bacon, ovo, alface, tomate e maionese no pão de brioche.",
    price: 30.00,
    imageUrl: "https://via.placeholder.com/150/33FF57/FFFFFF?text=X-Salada",
  },
  {
    id: "3",
    name: "Batata Frita Grande",
    description: "Porção generosa de batatas fritas crocantes.",
    price: 15.00,
    imageUrl: "https://via.placeholder.com/150/3357FF/FFFFFF?text=Batata",
  },
  {
    id: "4",
    name: "Refrigerante Lata",
    description: "Coca-Cola, Guaraná, Soda Limonada (escolha a sua).",
    price: 7.00,
    imageUrl: "https://via.placeholder.com/150/FFFF33/000000?text=Refri",
  },
];

const Menu = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Nosso Cardápio</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            Voltar para o Início
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-2 lg:grid-cols-3 gap-6">
          {dummyMenuItems.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded-t-lg" />
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-2xl font-semibold text-primary">R$ {item.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90">Adicionar ao Pedido</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;