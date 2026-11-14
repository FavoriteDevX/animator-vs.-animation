import tkinter as tk
from tkinter import filedialog, messagebox
import random
import time

# Configurações de tempo (24 horas em segundos)
LIFESPAN_SECONDS = 24 * 60 * 60 

class DesktopPetApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Stick Figure Desktop Pet Launcher")
        self.root.geometry("360x320")
        self.root.resizable(False, False)
        
        self.sprite_paths = {"idle": None, "walk": None, "jump": None}
        self.setup_launcher_ui()

    def setup_launcher_ui(self):
        tk.Label(self.root, text="Stick Figure Life Creator", font=("Arial", 14, "bold")).pack(pady=10)
        tk.Label(self.root, text="Upload transparent PNG sprites (optional).\nYour pet will live on your screen for 24 hours.", font=("Arial", 9), fg="gray").pack(pady=5)

        # Botões de Upload
        for state in ["idle", "walk", "jump"]:
            frame = tk.Frame(self.root)
            frame.pack(pady=4, fill="x", padx=30)
            btn = tk.Button(frame, text=f"Upload {state.capitalize()} PNG", width=18, command=lambda s=state: self.select_file(s))
            btn.pack(side="left")
            lbl = tk.Label(frame, text="Default ASCII", font=("Arial", 8), fg="blue")
            lbl.pack(side="right")
            setattr(self, f"lbl_{state}", lbl)

        # Botão para dar vida
        tk.Button(self.root, text="BRING TO LIFE (24H)", bg="#28a745", fg="white", font=("Arial", 11, "bold"), command=self.start_pet).pack(pady=20)

    def select_file(self, state):
        path = filedialog.askopenfilename(filetypes=[("PNG Images", "*.png")])
        if path:
            self.sprite_paths[state] = path
            getattr(self, f"lbl_{state}").config(text="Loaded!", fg="green")

    def start_pet(self):
        # Esconde a janela de configuração e cria o pet na tela
        self.root.withdraw()
        self.pet_window = tk.Toplevel(self.root)
        self.pet_window.overrideredirect(True)
        self.pet_window.attributes('-topmost', True)
        
        # Fundo transparente (Windows)
        self.transparent_color = '#000001'
        self.pet_window.config(bg=self.transparent_color)
        self.pet_window.attributes('-transparentcolor', self.transparent_color)

        # Carrega imagens se o usuário enviou
        self.images = {}
        for state, path in self.sprite_paths.items():
            if path:
                try:
                    self.images[state] = tk.PhotoImage(file=path)
                except Exception as e:
                    messagebox.showerror("Error", f"Failed to load {state} image: {e}")

        self.label = tk.Label(self.pet_window, bg=self.transparent_color, fg="red", font=("Courier", 18, "bold"))
        self.label.pack()

        # Permite arrastar o boneco com o mouse
        self.label.bind("<Button-1>", self.start_drag)
        self.label.bind("<B1-Motion>", self.do_drag)
        self.label.bind("<ButtonRelease-1>", self.stop_drag)

        # Variáveis de física e ciclo de vida
        self.start_time = time.time()
        self.screen_w = self.pet_window.winfo_screenwidth()
        self.screen_h = self.pet_window.winfo_screenheight()
        self.x = self.screen_w // 2
        self.y = self.screen_h - 150
        self.vx = 0
        self.vy = 0
        self.is_dragging = False
        self.state = "idle"

        self.update_visuals()
        self.behavior_loop()
        self.physics_loop()

    def start_drag(self, event):
        self.is_dragging = True
        self.state = "jump"
        self.update_visuals()

    def do_drag(self, event):
        self.x = self.pet_window.winfo_pointerx() - 40
        self.y = self.pet_window.winfo_pointery() - 40

    def stop_drag(self, event):
        self.is_dragging = False
        self.vy = 0

    def update_visuals(self):
        if self.state in self.images:
            self.label.config(image=self.images[self.state], text="")
        else:
            # Boneco padrão caso o usuário não tenha sprites
            ascii_art = {
                "idle": " O \n/|\\\n/ \\",
                "walk": " O \n<|>\n/ \\",
                "jump": "\\O/\n | \n/ \\"
            }
            self.label.config(image="", text=ascii_art[self.state])

    def behavior_loop(self):
        if not self.is_dragging:
            action = random.choice(["idle", "walk_left", "walk_right", "jump"])
            if action == "idle":
                self.vx = 0
                self.state = "idle"
            elif action == "walk_left":
                self.vx = -4
                self.state = "walk"
            elif action == "walk_right":
                self.vx = 4
                self.state = "walk"
            elif action == "jump" and self.y >= self.screen_h - 150:
                self.vy = -15
                self.state = "jump"
            self.update_visuals()

        # Escolhe uma nova ação a cada 2.5 segundos
        self.pet_window.after(2500, self.behavior_loop)

    def physics_loop(self):
        # Verifica se as 24 horas acabaram
        elapsed = time.time() - self.start_time
        if elapsed >= LIFESPAN_SECONDS:
            messagebox.showinfo("Time's Up!", "Your stick figure's 24-hour life cycle has ended. Run the app again to reactivate!")
            self.root.destroy()
            return

        if not self.is_dragging:
            # Gravidade
            self.vy += 1
            self.x += self.vx
            self.y += self.vy

            # Chão (acima da barra de tarefas)
            floor = self.screen_h - 140
            if self.y >= floor:
                self.y = floor
                self.vy = 0
                if self.state == "jump":
                    self.state = "idle"
                    self.update_visuals()

            # Paredes laterais
            if self.x <= 0:
                self.x = 0
                self.vx *= -1
            elif self.x >= self.screen_w - 80:
                self.x = self.screen_w - 80
                self.vx *= -1

        self.pet_window.geometry(f"+{int(self.x)}+{int(self.y)}")
        self.pet_window.after(30, self.physics_loop)

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = DesktopPetApp()
    app.run()
