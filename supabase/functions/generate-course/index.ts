import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LessonStructure {
  title: string;
  subtopics?: string[];
}

interface VideoResult {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, courseId } = await req.json();
    console.log('Generating course for:', topic);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

    if (!LOVABLE_API_KEY || !YOUTUBE_API_KEY) {
      throw new Error('Missing required API keys');
    }

    // Step 1: Decompose topic into lessons using Gemini
    console.log('Step 1: Decomposing topic...');
    const decompositionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert course designer. Break down topics into 4-6 sequential learning modules. If the topic is too specific for multiple lessons, return it as a single comprehensive lesson.'
          },
          {
            role: 'user',
            content: `Analyze this topic and break it into 4-6 sequential lessons: "${topic}". Return ONLY valid JSON with this structure: {"lessons": [{"title": "lesson name"}]}`
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!decompositionResponse.ok) {
      const error = await decompositionResponse.text();
      console.error('Decomposition error:', error);
      throw new Error('Failed to decompose topic');
    }

    const decompositionData = await decompositionResponse.json();
    const lessonsStructure: LessonStructure[] = JSON.parse(
      decompositionData.choices[0].message.content
    ).lessons;

    console.log('Lessons structure:', lessonsStructure);

    // Step 2: For each lesson, find videos, generate notes and quiz
    const lessons = await Promise.all(
      lessonsStructure.map(async (lessonStruct, index) => {
        console.log(`Processing lesson ${index + 1}: ${lessonStruct.title}`);

        // Find YouTube videos
        const videoSearchQuery = encodeURIComponent(`${topic} ${lessonStruct.title} tutorial`);
        const youtubeResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&q=${videoSearchQuery}&type=video&videoCategoryId=27&key=${YOUTUBE_API_KEY}`
        );

        const youtubeData = await youtubeResponse.json();
        const videos: VideoResult[] = youtubeData.items?.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails.medium.url,
        })) || [];

        // Generate study notes using Gemini
        const notesResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are an expert educator. Create comprehensive, well-structured study notes in markdown format.'
              },
              {
                role: 'user',
                content: `Create detailed 300-word study notes for: "${lessonStruct.title}" in the context of "${topic}". Include key concepts, explanations, and examples. Format with clear headings and bullet points.`
              }
            ],
          }),
        });

        const notesData = await notesResponse.json();
        const notes = notesData.choices[0].message.content;

        // Generate quiz using Gemini with structured output
        const quizResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are a quiz generator. Create educational multiple-choice questions.'
              },
              {
                role: 'user',
                content: `Create 5 multiple-choice questions about "${lessonStruct.title}" in the context of "${topic}". Return ONLY valid JSON with this structure: {"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0}]}`
              }
            ],
            response_format: { type: 'json_object' }
          }),
        });

        const quizData = await quizResponse.json();
        const quiz = JSON.parse(quizData.choices[0].message.content);

        return {
          title: lessonStruct.title,
          videos,
          notes,
          quiz,
        };
      })
    );

    console.log('Course generation complete');

    return new Response(
      JSON.stringify({ lessons }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-course:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
