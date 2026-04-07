import { supabase } from './supabaseClient'

export async function uploadQuestionImage(file: File): Promise<string> {

    const fileName = `${Date.now()}-${file.name}`
        
    const { error } = await supabase.storage
        .from('quiz-images') // naam van de bucket
        .upload(fileName, file, { upsert: false })
        if (error) throw new Error(error.message)
        // Publieke URL ophalen om op te slaan in image_url kolom

    const { data } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(fileName)

    return data.publicUrl
}