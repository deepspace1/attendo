#!/usr/bin/env python3
"""
GUI Barcode Scanner - Code 39 Detector
Tkinter-based GUI for barcode scanning

Usage:
    python gui_scanner.py
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox
import cv2
import threading
import sys
import os
from datetime import datetime
from PIL import Image, ImageTk

# Add utils to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.detector import BarcodeDetector
from utils.display import DisplayManager


class BarcodeScannerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Python Universal Barcode Scanner - All Types")
        self.root.geometry("800x600")
        
        # Initialize components
        self.detector = BarcodeDetector()
        self.display = DisplayManager()
        
        # Camera and scanning state
        self.cap = None
        self.scanning = False
        self.camera_index = 0
        
        # Detection tracking
        self.detected_barcodes = []
        self.last_detected_data = None
        
        # Create GUI
        self.create_widgets()
        self.setup_layout()
        
    def create_widgets(self):
        """Create all GUI widgets"""
        # Main frame
        self.main_frame = ttk.Frame(self.root, padding="10")
        
        # Title
        self.title_label = ttk.Label(self.main_frame,
                                   text="🔍 Python Universal Barcode Scanner",
                                   font=("Arial", 16, "bold"))
        
        # Control frame
        self.control_frame = ttk.Frame(self.main_frame)
        
        # Camera selection
        self.camera_label = ttk.Label(self.control_frame, text="Camera:")
        self.camera_var = tk.StringVar(value="0")
        self.camera_combo = ttk.Combobox(self.control_frame, textvariable=self.camera_var,
                                       values=["0", "1", "2"], width=5)
        
        # Control buttons
        self.start_button = ttk.Button(self.control_frame, text="📷 Start Scanning",
                                     command=self.start_scanning)
        self.stop_button = ttk.Button(self.control_frame, text="⏹️ Stop Scanning",
                                    command=self.stop_scanning, state="disabled")
        self.save_button = ttk.Button(self.control_frame, text="💾 Save Detections",
                                    command=self.save_detections)
        self.clear_button = ttk.Button(self.control_frame, text="🗑️ Clear History",
                                     command=self.clear_detections)
        
        # Video frame
        self.video_frame = ttk.LabelFrame(self.main_frame, text="Camera Feed", padding="5")
        self.video_label = ttk.Label(self.video_frame, text="Camera feed will appear here",
                                   background="black", foreground="white")
        
        # Detection info frame
        self.info_frame = ttk.LabelFrame(self.main_frame, text="Detection Information", padding="5")
        
        # Current detection display
        self.current_frame = ttk.Frame(self.info_frame)
        self.current_label = ttk.Label(self.current_frame, text="Last Detection:",
                                     font=("Arial", 10, "bold"))
        self.current_data = ttk.Label(self.current_frame, text="None",
                                    font=("Arial", 12), foreground="blue")
        
        # Statistics
        self.stats_frame = ttk.Frame(self.info_frame)
        self.stats_label = ttk.Label(self.stats_frame, text="Statistics:",
                                   font=("Arial", 10, "bold"))
        self.total_label = ttk.Label(self.stats_frame, text="Total: 0")
        self.code39_label = ttk.Label(self.stats_frame, text="Code 39: 0")
        
        # Detection history
        self.history_frame = ttk.LabelFrame(self.main_frame, text="Detection History", padding="5")
        self.history_text = scrolledtext.ScrolledText(self.history_frame, height=8, width=70)
        
        # Status bar
        self.status_var = tk.StringVar(value="Ready to scan")
        self.status_bar = ttk.Label(self.main_frame, textvariable=self.status_var,
                                  relief="sunken", anchor="w")
        
    def setup_layout(self):
        """Setup widget layout"""
        # Main frame
        self.main_frame.grid(row=0, column=0, sticky="nsew")
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(0, weight=1)
        
        # Title
        self.title_label.grid(row=0, column=0, columnspan=2, pady=(0, 10))
        
        # Control frame
        self.control_frame.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(0, 10))
        
        # Camera controls
        self.camera_label.grid(row=0, column=0, padx=(0, 5))
        self.camera_combo.grid(row=0, column=1, padx=(0, 10))
        
        # Buttons
        self.start_button.grid(row=0, column=2, padx=5)
        self.stop_button.grid(row=0, column=3, padx=5)
        self.save_button.grid(row=0, column=4, padx=5)
        self.clear_button.grid(row=0, column=5, padx=5)
        
        # Video frame
        self.video_frame.grid(row=2, column=0, sticky="nsew", padx=(0, 10))
        self.video_label.grid(row=0, column=0, sticky="nsew")
        self.video_frame.grid_rowconfigure(0, weight=1)
        self.video_frame.grid_columnconfigure(0, weight=1)
        
        # Info frame
        self.info_frame.grid(row=2, column=1, sticky="nsew")
        
        # Current detection
        self.current_frame.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        self.current_label.grid(row=0, column=0, sticky="w")
        self.current_data.grid(row=1, column=0, sticky="w")
        
        # Statistics
        self.stats_frame.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        self.stats_label.grid(row=0, column=0, sticky="w")
        self.total_label.grid(row=1, column=0, sticky="w")
        self.code39_label.grid(row=2, column=0, sticky="w")
        
        # History
        self.history_frame.grid(row=3, column=0, columnspan=2, sticky="nsew", pady=(10, 0))
        self.history_text.grid(row=0, column=0, sticky="nsew")
        self.history_frame.grid_rowconfigure(0, weight=1)
        self.history_frame.grid_columnconfigure(0, weight=1)
        
        # Status bar
        self.status_bar.grid(row=4, column=0, columnspan=2, sticky="ew", pady=(10, 0))
        
        # Configure grid weights
        self.main_frame.grid_rowconfigure(2, weight=1)
        self.main_frame.grid_rowconfigure(3, weight=1)
        self.main_frame.grid_columnconfigure(0, weight=2)
        self.main_frame.grid_columnconfigure(1, weight=1)
        
    def start_scanning(self):
        """Start barcode scanning"""
        try:
            self.camera_index = int(self.camera_var.get())
            self.cap = cv2.VideoCapture(self.camera_index)
            
            if not self.cap.isOpened():
                messagebox.showerror("Error", f"Could not open camera {self.camera_index}")
                return
            
            # Set camera properties
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            
            self.scanning = True
            self.start_button.config(state="disabled")
            self.stop_button.config(state="normal")
            self.status_var.set("Scanning for barcodes...")
            
            # Start scanning thread
            self.scan_thread = threading.Thread(target=self.scan_loop, daemon=True)
            self.scan_thread.start()
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to start scanning: {str(e)}")
    
    def stop_scanning(self):
        """Stop barcode scanning"""
        self.scanning = False
        if self.cap:
            self.cap.release()
        
        self.start_button.config(state="normal")
        self.stop_button.config(state="disabled")
        self.status_var.set("Scanning stopped")
        
        # Clear video display
        self.video_label.config(image="", text="Camera feed stopped")
    
    def scan_loop(self):
        """Main scanning loop (runs in separate thread)"""
        while self.scanning:
            try:
                ret, frame = self.cap.read()
                if not ret:
                    break
                
                # Detect barcodes
                barcodes = self.detector.detect_barcodes(frame)
                
                for barcode in barcodes:
                    barcode_info = self.detector.process_barcode(barcode)

                    # Process all supported barcode types
                    if self.detector.is_supported_barcode(barcode_info):
                        # Validate barcode data
                        if self.detector.validate_barcode_data(barcode_info):
                            # Avoid duplicates
                            if self.last_detected_data != barcode_info['data']:
                                self.detected_barcodes.append(barcode_info)
                                self.last_detected_data = barcode_info['data']

                                # Update GUI (must be done in main thread)
                                self.root.after(0, self.update_detection_display, barcode_info)

                            # Draw overlay
                            frame = self.display.draw_detection_overlay(frame, barcode_info)
                
                # Update video display
                self.root.after(0, self.update_video_display, frame)
                
            except Exception as e:
                print(f"Error in scan loop: {e}")
                break
    
    def update_video_display(self, frame):
        """Update video display in GUI"""
        try:
            # Convert frame to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Resize frame to fit display
            height, width = frame_rgb.shape[:2]
            max_width, max_height = 400, 300
            
            if width > max_width or height > max_height:
                scale = min(max_width/width, max_height/height)
                new_width = int(width * scale)
                new_height = int(height * scale)
                frame_rgb = cv2.resize(frame_rgb, (new_width, new_height))
            
            # Convert to PhotoImage
            image = Image.fromarray(frame_rgb)
            photo = ImageTk.PhotoImage(image)
            
            # Update label
            self.video_label.config(image=photo, text="")
            self.video_label.image = photo  # Keep a reference
            
        except Exception as e:
            print(f"Error updating video display: {e}")
    
    def update_detection_display(self, barcode_info):
        """Update detection information display"""
        # Update current detection
        self.current_data.config(text=f"{barcode_info['type']}: {barcode_info['data']}")
        
        # Update statistics
        stats = self.detector.get_detection_stats()
        self.total_label.config(text=f"Total: {stats['total_detections']}")
        self.code39_label.config(text=f"Linear: {stats['linear_barcodes']} | 2D: {stats['matrix_barcodes']}")
        
        # Add to history
        history_entry = (f"[{barcode_info['timestamp']}] "
                        f"{barcode_info['type']}: {barcode_info['data']} "
                        f"(Confidence: {barcode_info['confidence']:.1f}%)\n")
        
        self.history_text.insert(tk.END, history_entry)
        self.history_text.see(tk.END)
        
        # Update status
        self.status_var.set(f"Detected: {barcode_info['data']}")
    
    def save_detections(self):
        """Save detections to file"""
        if not self.detected_barcodes:
            messagebox.showwarning("Warning", "No detections to save")
            return
        
        filename = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            initialname=f"detections_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        
        if filename:
            try:
                self.detector.save_detection(self.detected_barcodes[-1], filename)
                messagebox.showinfo("Success", f"Detections saved to {filename}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save: {str(e)}")
    
    def clear_detections(self):
        """Clear detection history"""
        self.detected_barcodes.clear()
        self.detector.detected_barcodes.clear()
        self.last_detected_data = None
        
        self.current_data.config(text="None")
        self.total_label.config(text="Total: 0")
        self.code39_label.config(text="Linear: 0 | 2D: 0")
        self.history_text.delete(1.0, tk.END)
        self.status_var.set("Detection history cleared")
    
    def on_closing(self):
        """Handle window closing"""
        if self.scanning:
            self.stop_scanning()
        self.root.destroy()


def main():
    """Main function"""
    root = tk.Tk()
    app = BarcodeScannerGUI(root)
    
    # Handle window closing
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    
    # Start GUI
    root.mainloop()


if __name__ == "__main__":
    main()
