import BufferLoader from "./util/BufferLoader";

// TODO make parameterizable
const MAX_NB_FRAGMENTS_IN_AUDIO_MIX = 4;
const TIME_OFFSET_IN_AUDIO_MIX = 5;


// First approximation of an equal-power gain curve.
function computeGain(nbFeeds: number): number {
  // Use an equal-power cross-fading curve:
  return Math.cos(((nbFeeds - 1) * 0.5 * Math.PI) / nbFeeds);
}

function shuffle(array: []) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const onBuffersLoaded = (context, gain, timeOffset) => (bufferList: []) => {
  var gainNode = context.createGain();
  gainNode.gain.value = gain;
  gainNode.connect(context.destination);
  // loop on bufferList
  bufferList.forEach((buffer, index) => {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);
    source.start(timeOffset * index);
  });
}


export const playAudioMix = (kw: string) => {
  // Fetch all fragment occurrences of the same keyword
  const fragmentsDict = window.electron.store.get('fragments');
  const fragments = Object.keys(fragmentsDict).map(id => Object.assign(fragmentsDict[id], {id}))
    .filter(fragment => fragment.keyword === kw);
  // Randomize their order
  shuffle(fragments);
  // Cap the number of fragments to play
  fragments.length = Math.min(fragments.length, MAX_NB_FRAGMENTS_IN_AUDIO_MIX);
  // Get the list of URIs
  const fragmentUris = fragments.map(fragment => `atom://${fragment.recording}`);
  // Create a specific gain to try to equalize the max power
  const gain = computeGain(fragments.length);
  // Compute the default time offset
  const timeOffset =  TIME_OFFSET_IN_AUDIO_MIX;
  // Load and play the fragments
  const context = new AudioContext();
  const bufferLoader = new BufferLoader(
    context,
    fragmentUris,
    onBuffersLoaded(context, gain, timeOffset)
  );
  bufferLoader.load();
};
