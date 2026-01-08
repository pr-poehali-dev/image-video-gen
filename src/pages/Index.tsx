import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface GeneratedItem {
  id: string;
  prompt: string;
  type: 'image' | 'video';
  url: string;
  timestamp: Date;
}

const TEMPLATE_PROMPTS = [
  { icon: 'Sparkles', text: 'Космический пейзаж с туманностями', category: 'Природа' },
  { icon: 'Palette', text: 'Абстрактное искусство в стиле киберпанк', category: 'Арт' },
  { icon: 'Camera', text: 'Портрет в стиле ренессанс', category: 'Портрет' },
  { icon: 'Zap', text: 'Футуристический город с неоновыми огнями', category: 'Фантастика' },
  { icon: 'Heart', text: 'Романтический закат на океане', category: 'Природа' },
  { icon: 'Boxes', text: '3D рендер абстрактных фигур', category: '3D' },
];

export default function Index() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [activeTab, setActiveTab] = useState('generate');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Введите промпт',
        description: 'Опишите изображение которое хотите создать',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('https://functions.poehali.dev/call/generate_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          safety_tolerance: 6
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка генерации');
      }

      const data = await response.json();
      
      const newItem: GeneratedItem = {
        id: Date.now().toString(),
        prompt,
        type: 'image',
        url: data.url,
        timestamp: new Date(),
      };

      setGeneratedItems([newItem, ...generatedItems]);
      setActiveTab('gallery');

      toast({
        title: 'Готово!',
        description: 'Изображение успешно создано',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать изображение. Попробуйте ещё раз.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateClick = (templateText: string) => {
    setPrompt(templateText);
    toast({
      title: 'Промпт добавлен',
      description: 'Можете отредактировать и запустить генерацию',
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(155, 135, 245, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(217, 70, 239, 0.15) 0%, transparent 50%)',
      }} />

      <div className="relative z-10">
        <header className="border-b border-border/50 glass">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center animate-glow">
                  <Icon name="Sparkles" className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">AI Generator</h1>
                  <p className="text-sm text-muted-foreground">Создавайте искусство с помощью AI</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="glass">
                  <Icon name="Zap" size={14} className="mr-1" />
                  Безлимит
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 glass mb-8">
              <TabsTrigger value="generate" className="gap-2">
                <Icon name="Wand2" size={16} />
                Генератор
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <Icon name="Images" size={16} />
                Галерея
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Icon name="Clock" size={16} />
                История
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-8 animate-fade-in">
              <Card className="glass border-border/50 p-8 max-w-3xl mx-auto">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Опишите что хотите создать</label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Например: Футуристический город с летающими машинами на закате..."
                      className="min-h-32 glass border-primary/30 focus:border-primary resize-none text-base"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex-1 gradient-primary hover:opacity-90 transition-opacity h-12 text-base font-semibold"
                    >
                      {isGenerating ? (
                        <>
                          <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                          Создаём магию...
                        </>
                      ) : (
                        <>
                          <Icon name="Sparkles" className="mr-2" size={20} />
                          Сгенерировать изображение
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="max-w-5xl mx-auto">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Icon name="Lightbulb" size={20} className="text-primary" />
                  Готовые шаблоны
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TEMPLATE_PROMPTS.map((template, index) => (
                    <Card
                      key={index}
                      className="glass border-border/50 p-5 cursor-pointer hover-lift group"
                      onClick={() => handleTemplateClick(template.text)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Icon name={template.icon as any} size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="mb-2 text-xs">{template.category}</Badge>
                          <p className="text-sm leading-relaxed">{template.text}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="animate-fade-in">
              {generatedItems.length === 0 ? (
                <Card className="glass border-border/50 p-16 max-w-2xl mx-auto text-center">
                  <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center animate-float">
                    <Icon name="Images" size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Галерея пуста</h3>
                  <p className="text-muted-foreground mb-6">Создайте первое изображение чтобы увидеть его здесь</p>
                  <Button onClick={() => setActiveTab('generate')} className="gradient-primary">
                    <Icon name="Plus" className="mr-2" size={18} />
                    Создать изображение
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {generatedItems.map((item, index) => (
                    <Card key={item.id} className="glass border-border/50 overflow-hidden group hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        <img src={item.url} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white text-sm font-medium line-clamp-2">{item.prompt}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            <Icon name="Image" size={12} className="mr-1" />
                            {item.type === 'image' ? 'Изображение' : 'Видео'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString('ru')}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="animate-fade-in">
              {generatedItems.length === 0 ? (
                <Card className="glass border-border/50 p-16 max-w-2xl mx-auto text-center">
                  <div className="w-20 h-20 rounded-full gradient-accent mx-auto mb-6 flex items-center justify-center animate-float">
                    <Icon name="Clock" size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">История пуста</h3>
                  <p className="text-muted-foreground">Здесь будут отображаться все ваши запросы</p>
                </Card>
              ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                  {generatedItems.map((item, index) => (
                    <Card key={item.id} className="glass border-border/50 p-6 hover-lift group" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.url} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <p className="font-medium leading-relaxed">{item.prompt}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPrompt(item.prompt);
                                setActiveTab('generate');
                              }}
                              className="flex-shrink-0"
                            >
                              <Icon name="RefreshCw" size={16} />
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="Calendar" size={14} />
                              {item.timestamp.toLocaleDateString('ru')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={14} />
                              {item.timestamp.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}