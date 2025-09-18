import { Card, CardContent } from '@/components/ui/card';
import morningCoffeeImage from '@/assets/daily-situations/morning-coffee.jpg';
import cookingDinnerImage from '@/assets/daily-situations/cooking-dinner.jpg';
import readingBookImage from '@/assets/daily-situations/reading-book.jpg';
import walkingParkImage from '@/assets/daily-situations/walking-park.jpg';
import brushingTeethImage from '@/assets/daily-situations/brushing-teeth.jpg';
import familyBreakfastImage from '@/assets/daily-situations/family-breakfast.jpg';
import supermarketShoppingImage from '@/assets/daily-situations/supermarket-shopping.jpg';
import drivingWorkImage from '@/assets/daily-situations/driving-work.jpg';
import takingShowerImage from '@/assets/daily-situations/taking-shower.jpg';
import watchingTvImage from '@/assets/daily-situations/watching-tv.jpg';

interface DailySituationsCardProps {
  sentence: {
    id: string;
    english_text: string;
    portuguese_text: string;
    category: string | null;
  };
  exerciseType?: string;
}

const imageMap: Record<string, string> = {
  'I am drinking coffee in the morning': morningCoffeeImage,
  'She is cooking dinner in the kitchen': cookingDinnerImage,
  'He is reading a book on the sofa': readingBookImage,
  'They are walking in the park': walkingParkImage,
  'I am brushing my teeth': brushingTeethImage,
  'The family is eating breakfast': familyBreakfastImage,
  'She is shopping at the supermarket': supermarketShoppingImage,
  'He is driving to work': drivingWorkImage,
  'I am taking a shower': takingShowerImage,
  'We are watching TV together': watchingTvImage,
};

export const DailySituationsCard = ({ sentence, exerciseType }: DailySituationsCardProps) => {
  if (sentence.category !== 'daily_situations') {
    return null;
  }

  const imageSrc = imageMap[sentence.english_text];

  return (
    <Card className="shadow-card mb-6">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {imageSrc && (
            <div className="w-full md:w-1/2">
              <img 
                src={imageSrc}
                alt={sentence.portuguese_text}
                className="w-full h-48 md:h-32 object-cover rounded-lg shadow-sm"
              />
            </div>
          )}
          <div className="w-full md:w-1/2 space-y-3">
            <div className="text-center md:text-left">
              {exerciseType === 'translate' ? (
                <p className="text-lg font-semibold text-foreground">
                  {sentence.portuguese_text}
                </p>
              ) : (
                <>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    {sentence.portuguese_text}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sentence.english_text}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};