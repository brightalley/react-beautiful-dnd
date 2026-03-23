// @flow
import type {
  DraggableId,
  DragStart,
  DragUpdate,
  DropResult,
  DraggableLocation,
  Combine,
} from './types';

export type MessagePreset = {|
  dragHandleUsageInstructions: string,
  onDragStart: (start: DragStart) => string,
  onDragUpdate: (update: DragUpdate) => string,
  onDragEnd: (result: DropResult) => string,
|};

const dragHandleUsageInstructions: string = `
  Druk op de spatiebalk om te beginnen met slepen.
  Tijdens het slepen kun je de pijltjestoetsen gebruiken om het item te verplaatsen en escape om te annuleren.
  Sommige screen readers vereisen mogelijk dat je in focusmodus bent of een pass-through commando gebruikt
`;

const position = (index: number): number => index + 1;

// We cannot list what index the Droppable is in automatically as we are not sure how
// the Droppable's have been configured
const onDragStart = (start: DragStart): string => `
  Je hebt een item opgepakt op positie ${position(start.source.index)}
`;

const withLocation = (
  source: DraggableLocation,
  destination: DraggableLocation,
) => {
  const isInHomeList: boolean = source.droppableId === destination.droppableId;

  const startPosition: number = position(source.index);
  const endPosition: number = position(destination.index);

  if (isInHomeList) {
    return `
      Je hebt het item verplaatst van positie ${startPosition}
      naar positie ${endPosition}
    `;
  }

  return `
    Je hebt het item verplaatst van positie ${startPosition}
    in lijst ${source.droppableId}
    naar lijst ${destination.droppableId}
    in positie ${endPosition}
  `;
};

const withCombine = (
  id: DraggableId,
  source: DraggableLocation,
  combine: Combine,
): string => {
  const inHomeList: boolean = source.droppableId === combine.droppableId;

  if (inHomeList) {
    return `
      Het item ${id}
      is gecombineerd met ${combine.draggableId}`;
  }

  return `
      Het item ${id}
      in lijst ${source.droppableId}
      is gecombineerd met ${combine.draggableId}
      in lijst ${combine.droppableId}
    `;
};

const onDragUpdate = (update: DragUpdate): string => {
  const location: ?DraggableLocation = update.destination;
  if (location) {
    return withLocation(update.source, location);
  }

  const combine: ?Combine = update.combine;
  if (combine) {
    return withCombine(update.draggableId, update.source, combine);
  }

  return 'Je bevindt je niet boven een doelgebied';
};

const returnedToStart = (source: DraggableLocation): string => `
  Het item is teruggekeerd naar startpositie ${position(source.index)}
`;

const onDragEnd = (result: DropResult): string => {
  if (result.reason === 'CANCEL') {
    return `
      Verplaatsing geannuleerd.
      ${returnedToStart(result.source)}
    `;
  }

  const location: ?DraggableLocation = result.destination;
  const combine: ?Combine = result.combine;

  if (location) {
    return `
      Je hebt het item neergezet.
      ${withLocation(result.source, location)}
    `;
  }

  if (combine) {
    return `
      Je hebt het item neergezet.
      ${withCombine(result.draggableId, result.source, combine)}
    `;
  }

  return `
    Het item is niet boven een doelgebied losgelaten.
    ${returnedToStart(result.source)}
  `;
};

const preset: MessagePreset = {
  dragHandleUsageInstructions,
  onDragStart,
  onDragUpdate,
  onDragEnd,
};

export default preset;
