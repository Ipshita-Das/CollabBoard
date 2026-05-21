from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

app = FastAPI()

print("Waking up the local ML model...")

# 1. Bypass the pipeline wrapper and load the model directly
# This is much more robust and immune to versioning errors
tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-small")
model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-small")

print("Model loaded successfully! Ready for requests.")

class TaskData(BaseModel):
    title: str

@app.post("/generate-subtasks")
def generate_subtasks(task: TaskData):
    # 2. Engineer the prompt
    prompt = f"Step-by-step plan to: {task.title}"
    
    # 3. Convert the text prompt into model tokens
    inputs = tokenizer(prompt, return_tensors="pt")
    
    # 4. Generate the output tokens (max_new_tokens controls length)
    outputs = model.generate(**inputs, max_new_tokens=60)
    
    # 5. Decode the tokens back into human-readable English
    raw_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # 6. Parse the output into an array of subtasks
    subtasks_list = [step.strip().capitalize() for step in raw_text.split(',') if len(step) > 2]
    
    # Fallback in case the model returns one continuous sentence
    if len(subtasks_list) == 0:
        subtasks_list = [raw_text.capitalize()]

    return {"subtasks": subtasks_list}
# --- NEW SKILL 1: Auto-Write Descriptions ---
class DescriptionData(BaseModel):
    board_title: str

@app.post("/generate-description")
def generate_description(data: DescriptionData):
    # 1. Few-Shot Prompting: Teach it the exact pattern we want
    prompt = f"""Write a professional one-sentence description for a software project.
Project: E-Commerce Store
Description: A digital platform for browsing and purchasing products online.
Project: Cloud Storage
Description: A secure database system for uploading and organizing user files.
Project: {data.board_title}
Description:"""
    
    inputs = tokenizer(prompt, return_tensors="pt")
    
    # 2. Beam Search: Turn off randomness and force the highest-probability words
    outputs = model.generate(
        **inputs, 
        max_new_tokens=30,
        do_sample=False,  # Strict rule: NO hallucinating or random guessing
        num_beams=3       # Calculates the 3 most logical sentences and picks the best one
    )
    
    desc = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"description": desc.strip()}


# --- NEW SKILL 2: Contextual Task Suggestion ---
class ListContextData(BaseModel):
    list_name: str
    board_title: str

@app.post("/suggest-tasks")
def suggest_tasks(data: ListContextData):
    # 1. Simpler Prompt: FLAN models prefer direct instructions over complex templates
    prompt = f"Write a list of 3 steps to complete the '{data.list_name}' phase for a '{data.board_title}' project."
    
    inputs = tokenizer(prompt, return_tensors="pt")
    
    # 2. Re-enable light sampling so it doesn't get stuck repeating itself
    outputs = model.generate(
        **inputs, 
        max_new_tokens=50,
        do_sample=True,
        temperature=0.5,
        repetition_penalty=1.2
    )
    
    raw_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # 3. Aggressive Parsing: Replace periods and 'and' with commas to force a list
    cleaned_text = raw_text.replace(' and ', ',').replace('.', ',')
    tasks = [step.strip().capitalize() for step in cleaned_text.split(',') if len(step.strip()) > 4]
    
    # 4. GRACEFUL DEGRADATION (The Safety Net)
    # If the AI hallucinates, repeats the list name, or fails to make a list, we catch it!
    if len(tasks) < 2 or data.list_name.lower() in raw_text.lower() and len(raw_text) < 20:
        list_lower = data.list_name.lower()
        
        # Provide smart fallbacks based on common Kanban column names
        if "design" in list_lower or "ui" in list_lower or "ux" in list_lower:
            tasks = ["Draft initial wireframes", "Select color palette and typography", "Create high-fidelity prototypes"]
        elif "back" in list_lower or "api" in list_lower or "data" in list_lower:
            tasks = ["Design database schema", "Set up server routing", "Implement security and authentication"]
        elif "test" in list_lower or "qa" in list_lower:
            tasks = ["Write unit testing scripts", "Perform manual user flow testing", "Log and resolve identified bugs"]
        else:
            # Generic fallback for any other list name
            tasks = [f"Outline strategy for {data.list_name}", f"Execute core {data.list_name} deliverables", "Review and refine work"]
            
    return {"tasks": tasks[:3]} # Ensure we always return exactly 3 tasks