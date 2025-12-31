import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "../lib/utils";

const StarRating = ({ initialRating = 0, onRate, readOnly = false }) => {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(initialRating);

  const handleRate = (value) => {
    if (readOnly) return;
    setRating(value);
    if (onRate) onRate(value);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={cn(
            "transition-colors duration-200",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
          onClick={() => handleRate(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          <Star
            size={readOnly ? 16 : 24}
            className={cn(
              "fill-current",
              star <= (hover || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 fill-transparent"
            )}
          />
        </button>
      ))}
      {!readOnly && rating > 0 && (
        <span className="ml-2 text-sm text-gray-500 font-medium">
          {rating}/5
        </span>
      )}
    </div>
  );
};

export default StarRating;
