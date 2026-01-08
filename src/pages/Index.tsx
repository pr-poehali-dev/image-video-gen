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

const IMAGE_TEMPLATES = [
  { icon: 'Sparkles', text: 'Космический пейзаж с туманностями', category: 'Природа' },
  { icon: 'Palette', text: 'Абстрактное искусство в стиле киберпанк', category: 'Арт' },
  { icon: 'Camera', text: 'Портрет в стиле ренессанс', category: 'Портрет' },
  { icon: 'Zap', text: 'Футуристический город с неоновыми огнями', category: 'Фантастика' },
];

const VIDEO_TEMPLATES = [
  { icon: 'Film', text: 'Облака движутся над горным пейзажем', category: 'Природа' },
  { icon: 'Waves', text: 'Океанские волны разбиваются о берег', category: 'Вода' },
  { icon: 'Flame', text: 'Огонь танцует в камине', category: 'Огонь' },
  { icon: 'Wind', text: 'Северное сияние в ночном небе', category: 'Небо' },
];

export default function Index() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [activeTab, setActiveTab] = useState('image');
  const [viewTab, setViewTab] = useState('generator');
  const { toast } = useToast();

  const handleGenerateImage = async () => {
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
      setViewTab('gallery');

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

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Введите промпт',
        description: 'Опишите видео которое хотите создать',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('https://functions.poehali.dev/call/generate_video', {
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
        type: 'video',
        url: data.url,
        timestamp: new Date(),
      };

      setGeneratedItems([newItem, ...generatedItems]);
      setViewTab('gallery');

      toast({
        title: 'Готово!',
        description: 'Видео успешно создано',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать видео. Попробуйте ещё раз.',
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

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast({
        title: 'Скачано',
        description: 'Файл успешно сохранен',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скачать файл',
        variant: 'destructive',
      });
    }
  };

  const currentTemplates = activeTab === 'image' ? IMAGE_TEMPLATES : VIDEO_TEMPLATES;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                  <Icon name="Sparkles" className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">AI Generator</h1>
                  <p className="text-sm text-muted-foreground">Создавайте контент с помощью AI</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs value={viewTab} onValueChange={setViewTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="generator" className="gap-2">
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

            <TabsContent value="generator" className="space-y-8 animate-fade-in">
              <div className="max-w-4xl mx-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="image" className="gap-2">
                      <Icon name="Image" size={16} />
                      Изображение
                    </TabsTrigger>
                    <TabsTrigger value="video" className="gap-2">
                      <Icon name="Video" size={16} />
                      Видео
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="image" className="space-y-8">
                    <Card className="border p-8">
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm font-medium mb-3 block">Опишите изображение</label>
                          <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Например: Футуристический город с летающими машинами на закате..."
                            className="min-h-32 resize-none text-base"
                          />
                        </div>

                        <Button
                          onClick={handleGenerateImage}
                          disabled={isGenerating}
                          className="w-full bg-black hover:bg-black/90 h-12 text-base font-semibold"
                        >
                          {isGenerating ? (
                            <>
                              <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                              Создаём изображение...
                            </>
                          ) : (
                            <>
                              <Icon name="Sparkles" className="mr-2" size={20} />
                              Сгенерировать изображение
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>

                    <div>
                      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Icon name="Lightbulb" size={20} />
                        Готовые шаблоны
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {IMAGE_TEMPLATES.map((template, index) => (
                          <Card
                            key={index}
                            className="border p-5 cursor-pointer hover-lift group"
                            onClick={() => handleTemplateClick(template.text)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
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

                  <TabsContent value="video" className="space-y-8">
                    <Card className="border p-8">
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm font-medium mb-3 block">Опишите видео</label>
                          <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Например: Закат над океаном с движущимися облаками..."
                            className="min-h-32 resize-none text-base"
                          />
                        </div>

                        <Button
                          onClick={handleGenerateVideo}
                          disabled={isGenerating}
                          className="w-full bg-black hover:bg-black/90 h-12 text-base font-semibold"
                        >
                          {isGenerating ? (
                            <>
                              <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                              Создаём видео...
                            </>
                          ) : (
                            <>
                              <Icon name="Film" className="mr-2" size={20} />
                              Сгенерировать видео
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>

                    <div>
                      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Icon name="Lightbulb" size={20} />
                        Готовые шаблоны
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {VIDEO_TEMPLATES.map((template, index) => (
                          <Card
                            key={index}
                            className="border p-5 cursor-pointer hover-lift group"
                            onClick={() => handleTemplateClick(template.text)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
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
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="animate-fade-in">
              {generatedItems.length === 0 ? (
                <Card className="border p-16 max-w-2xl mx-auto text-center">
                  <div className="w-20 h-20 rounded-full bg-black mx-auto mb-6 flex items-center justify-center">
                    <Icon name="Images" size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Галерея пуста</h3>
                  <p className="text-muted-foreground mb-6">Создайте первый контент чтобы увидеть его здесь</p>
                  <Button onClick={() => setViewTab('generator')} className="bg-black hover:bg-black/90">
                    <Icon name="Plus" className="mr-2" size={18} />
                    Создать контент
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {generatedItems.map((item, index) => (
                    <Card key={item.id} className="border overflow-hidden group hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        {item.type === 'image' ? (
                          <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" controls />
                        )}
                        <div className="absolute top-3 right-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(item.url, `${item.type}-${item.id}.${item.type === 'image' ? 'png' : 'mp4'}`)}
                            className="bg-white/90 hover:bg-white"
                          >
                            <Icon name="Download" size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            <Icon name={item.type === 'image' ? 'Image' : 'Video'} size={12} className="mr-1" />
                            {item.type === 'image' ? 'Изображение' : 'Видео'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString('ru')}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{item.prompt}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="animate-fade-in">
              {generatedItems.length === 0 ? (
                <Card className="border p-16 max-w-2xl mx-auto text-center">
                  <div className="w-20 h-20 rounded-full bg-black mx-auto mb-6 flex items-center justify-center">
                    <Icon name="Clock" size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">История пуста</h3>
                  <p className="text-muted-foreground">Здесь будут отображаться все ваши запросы</p>
                </Card>
              ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                  {generatedItems.map((item, index) => (
                    <Card key={item.id} className="border p-6 hover-lift group" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                          {item.type === 'image' ? (
                            <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
                          ) : (
                            <video src={item.url} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <p className="font-medium leading-relaxed">{item.prompt}</p>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPrompt(item.prompt);
                                  setActiveTab(item.type);
                                  setViewTab('generator');
                                }}
                              >
                                <Icon name="RefreshCw" size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(item.url, `${item.type}-${item.id}.${item.type === 'image' ? 'png' : 'mp4'}`)}
                              >
                                <Icon name="Download" size={16} />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {item.type === 'image' ? 'Изображение' : 'Видео'}
                            </Badge>
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
