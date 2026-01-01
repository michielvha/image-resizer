import './styles/index.css';
import './styles/components.css';
import { createIcons, Image as ImageIcon, Moon, Sun, Download, Upload, X, Maximize2 } from 'lucide';
import { showToast } from './utils/toast';
import { loadTheme, saveTheme } from './utils/storage';
import { resizeImage, type AspectRatio, type ResizeOptions } from './utils/imageProcessor';

type ThemeMode = 'light' | 'dark';

class App {
  private theme: ThemeMode;
  private originalImage: HTMLImageElement | null = null;
  private processedImage: Blob | null = null;
  private originalImageUrl: string | null = null;

  // DOM elements
  private uploadZone!: HTMLElement;
  private fileInput!: HTMLInputElement;
  private themeToggle!: HTMLInputElement;
  private imagePreviewContainer!: HTMLElement;
  private originalPreview!: HTMLElement;
  private processedPreview!: HTMLElement;
  private downloadBtn!: HTMLButtonElement;
  private clearBtn!: HTMLButtonElement;
  
  // Controls
  private aspectRatioSelect!: HTMLSelectElement;
  private customWidthInput!: HTMLInputElement;
  private customHeightInput!: HTMLInputElement;
  private widthInput!: HTMLInputElement;
  private heightInput!: HTMLInputElement;
  private percentageInput!: HTMLInputElement;
  private maintainAspectRatioCheckbox!: HTMLInputElement;
  private qualityInput!: HTMLInputElement;
  private applyBtn!: HTMLButtonElement;

  // Current options
  private currentOptions: ResizeOptions = {
    aspectRatio: 'original',
    maintainAspectRatio: true,
    quality: 0.92,
  };

  constructor() {
    this.theme = loadTheme();
    this.init();
  }

  private init(): void {
    this.setupDOM();
    this.applyTheme(this.theme);
    this.attachEventListeners();
    this.initIcons();
  }

  private initIcons(): void {
    createIcons({
      icons: {
        Image: ImageIcon,
        Moon,
        Sun,
        Download,
        Upload,
        X,
        Maximize2,
      },
    });
  }

  private setupDOM(): void {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (!app) {
      throw new Error('App container not found');
    }

    app.innerHTML = `
      <div class="header">
        <div class="header-content">
          <div class="logo">
            <div class="logo-icon">
              <i data-lucide="maximize-2"></i>
            </div>
            <span>Image Resizer</span>
          </div>
          <div class="tagline">Resize images and change aspect ratios, 100% client-side</div>
        </div>
        <div class="header-content">
          <label class="theme-toggle-btn">
            <input type="checkbox" id="theme-toggle" ${this.theme === 'dark' ? 'checked' : ''}>
            <div class="theme-toggle-icon">
              <i data-lucide="${this.theme === 'dark' ? 'moon' : 'sun'}"></i>
            </div>
          </label>
        </div>
      </div>

      <div class="main-content">
        <div class="controls-panel">
          <div class="control-group">
            <label class="control-label">Aspect Ratio</label>
            <select class="control-select" id="aspect-ratio-select">
              <option value="original">Original</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="4:1">4:1 (LinkedIn Banner)</option>
              <option value="3:1">3:1 (Wide)</option>
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div class="control-group" id="custom-aspect-ratio-group" style="display: none;">
            <label class="control-label">Custom Aspect Ratio</label>
            <div class="input-group">
              <input type="number" class="control-input" id="custom-width" placeholder="Width" min="1" value="16">
              <span>:</span>
              <input type="number" class="control-input" id="custom-height" placeholder="Height" min="1" value="9">
            </div>
          </div>

          <div class="control-group">
            <label class="control-label">Resize Mode</label>
            <select class="control-select" id="resize-mode-select">
              <option value="dimensions">Dimensions</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          <div class="control-group" id="dimensions-group">
            <label class="control-label">Dimensions</label>
            <div class="input-group">
              <input type="number" class="control-input" id="width-input" placeholder="Width" min="1">
              <span>×</span>
              <input type="number" class="control-input" id="height-input" placeholder="Height" min="1">
            </div>
            <label class="control-checkbox" style="margin-top: 0.5rem;">
              <input type="checkbox" id="maintain-aspect-ratio" checked>
              <span style="font-size: 0.875rem;">Maintain aspect ratio</span>
            </label>
          </div>

          <div class="control-group" id="percentage-group" style="display: none;">
            <label class="control-label">Percentage</label>
            <input type="number" class="control-input" id="percentage-input" placeholder="%" min="1" max="1000" value="100">
          </div>

          <div class="control-group">
            <label class="control-label">Quality</label>
            <input type="range" class="control-input" id="quality-input" min="0.1" max="1" step="0.01" value="0.92">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary);">
              <span>Lower</span>
              <span id="quality-value">92%</span>
              <span>Higher</span>
            </div>
          </div>

          <button class="btn btn-primary" id="apply-btn" disabled>
            Apply Changes
          </button>
        </div>

        <div class="upload-area">
          <div id="upload-zone" class="upload-zone">
            <input type="file" id="file-input" accept="image/*">
            <div class="upload-icon">
              <i data-lucide="upload"></i>
            </div>
            <div class="upload-text">Drop an image here or click to upload</div>
            <div class="upload-hint">Supports JPG, PNG, WebP, and other common image formats</div>
          </div>

          <div id="image-preview-container" class="image-preview-container hidden">
            <div class="preview-pane">
              <div class="preview-header">
                <div class="preview-title">Original</div>
                <button class="btn btn-ghost btn-icon" id="clear-btn" title="Clear">
                  <i data-lucide="x"></i>
                </button>
              </div>
              <div class="preview-image-container" id="original-preview">
                <div class="empty-state">
                  <div class="empty-state-icon">
                    <i data-lucide="image"></i>
                  </div>
                </div>
              </div>
              <div class="preview-actions">
                <div style="width: 2.25rem; height: 2.25rem; flex-shrink: 0;"></div>
              </div>
            </div>

            <div class="preview-pane">
              <div class="preview-header">
                <div class="preview-title">Resized</div>
                <div style="width: 2.25rem; height: 2.25rem; flex-shrink: 0;"></div>
              </div>
              <div class="preview-image-container" id="processed-preview">
                <div class="empty-state">
                  <div class="empty-state-icon">
                    <i data-lucide="image"></i>
                  </div>
                </div>
              </div>
              <div class="preview-actions">
                <button class="btn btn-primary" id="download-btn" disabled>
                  <i data-lucide="download"></i>
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Store references
    this.uploadZone = document.querySelector('#upload-zone') as HTMLElement;
    this.fileInput = document.querySelector('#file-input') as HTMLInputElement;
    this.themeToggle = document.querySelector('#theme-toggle') as HTMLInputElement;
    this.imagePreviewContainer = document.querySelector('#image-preview-container') as HTMLElement;
    this.originalPreview = document.querySelector('#original-preview') as HTMLElement;
    this.processedPreview = document.querySelector('#processed-preview') as HTMLElement;
    this.downloadBtn = document.querySelector('#download-btn') as HTMLButtonElement;
    this.clearBtn = document.querySelector('#clear-btn') as HTMLButtonElement;

    // Controls
    this.aspectRatioSelect = document.querySelector('#aspect-ratio-select') as HTMLSelectElement;
    this.customWidthInput = document.querySelector('#custom-width') as HTMLInputElement;
    this.customHeightInput = document.querySelector('#custom-height') as HTMLInputElement;
    this.widthInput = document.querySelector('#width-input') as HTMLInputElement;
    this.heightInput = document.querySelector('#height-input') as HTMLInputElement;
    this.percentageInput = document.querySelector('#percentage-input') as HTMLInputElement;
    this.maintainAspectRatioCheckbox = document.querySelector('#maintain-aspect-ratio') as HTMLInputElement;
    this.qualityInput = document.querySelector('#quality-input') as HTMLInputElement;
    this.applyBtn = document.querySelector('#apply-btn') as HTMLButtonElement;

    if (!this.uploadZone || !this.fileInput || !this.themeToggle || !this.imagePreviewContainer ||
        !this.originalPreview || !this.processedPreview || !this.downloadBtn || !this.clearBtn ||
        !this.aspectRatioSelect || !this.qualityInput || !this.applyBtn) {
      throw new Error('Required DOM elements not found');
    }
  }

  private attachEventListeners(): void {
    // File input
    this.fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        this.handleFile(file);
      }
    });

    // Drag and drop
    this.uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadZone.classList.add('dragover');
    });

    this.uploadZone.addEventListener('dragleave', () => {
      this.uploadZone.classList.remove('dragover');
    });

    this.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleFile(file);
      } else {
        showToast('Please drop an image file', 'error');
      }
    });

    this.uploadZone.addEventListener('click', () => {
      this.fileInput.click();
    });

    // Theme toggle
    this.themeToggle.addEventListener('change', () => {
      this.theme = this.themeToggle.checked ? 'dark' : 'light';
      this.applyTheme(this.theme);
      saveTheme(this.theme);
    });

    // Controls
    this.aspectRatioSelect.addEventListener('change', () => {
      const customGroup = document.querySelector('#custom-aspect-ratio-group') as HTMLElement;
      if (this.aspectRatioSelect.value === 'custom') {
        customGroup.style.display = 'flex';
      } else {
        customGroup.style.display = 'none';
      }
    });

    const resizeModeSelect = document.querySelector('#resize-mode-select') as HTMLSelectElement;
    const dimensionsGroup = document.querySelector('#dimensions-group') as HTMLElement;
    const percentageGroup = document.querySelector('#percentage-group') as HTMLElement;

    resizeModeSelect.addEventListener('change', () => {
      if (resizeModeSelect.value === 'percentage') {
        dimensionsGroup.style.display = 'none';
        percentageGroup.style.display = 'flex';
      } else {
        dimensionsGroup.style.display = 'flex';
        percentageGroup.style.display = 'none';
      }
    });

    this.qualityInput.addEventListener('input', () => {
      const qualityValue = document.querySelector('#quality-value') as HTMLElement;
      if (qualityValue) {
        qualityValue.textContent = `${Math.round(parseFloat(this.qualityInput.value) * 100)}%`;
      }
    });

    // Apply button
    this.applyBtn.addEventListener('click', () => {
      this.applyResize();
    });

    // Download button
    this.downloadBtn.addEventListener('click', () => {
      this.downloadImage();
    });

    // Clear button
    this.clearBtn.addEventListener('click', () => {
      this.clearImage();
    });
  }

  private async handleFile(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    try {
      const imageUrl = URL.createObjectURL(file);
      const img = document.createElement('img');

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      this.originalImage = img;
      this.originalImageUrl = imageUrl;

      this.displayOriginalImage(imageUrl);

      document.querySelector('#upload-zone')?.classList.add('hidden');
      this.imagePreviewContainer.classList.remove('hidden');
      this.applyBtn.disabled = false;

      // Auto-apply with current settings
      this.applyResize();
    } catch (error) {
      console.error('Error loading image:', error);
      showToast('Failed to load image. Please try again.', 'error');
    }
  }

  private displayOriginalImage(url: string): void {
    this.originalPreview.innerHTML = `
      <img src="${url}" alt="Original" class="preview-image">
    `;
  }

  private async applyResize(): Promise<void> {
    if (!this.originalImage) {
      return;
    }

    try {
      const aspectRatio = this.aspectRatioSelect.value as AspectRatio;
      const resizeMode = (document.querySelector('#resize-mode-select') as HTMLSelectElement).value;

      const options: ResizeOptions = {
        aspectRatio,
        maintainAspectRatio: this.maintainAspectRatioCheckbox.checked,
        quality: parseFloat(this.qualityInput.value),
      };

      if (aspectRatio === 'custom') {
        options.customAspectRatio = {
          width: parseInt(this.customWidthInput.value) || 16,
          height: parseInt(this.customHeightInput.value) || 9,
        };
      }

      if (resizeMode === 'percentage') {
        options.percentage = parseInt(this.percentageInput.value) || 100;
      } else {
        const width = this.widthInput.value ? parseInt(this.widthInput.value) : undefined;
        const height = this.heightInput.value ? parseInt(this.heightInput.value) : undefined;
        if (width) options.width = width;
        if (height) options.height = height;
      }

      this.currentOptions = options;

      showToast('Processing image...', 'success');
      const blob = await resizeImage(this.originalImage, options);
      this.processedImage = blob;

      const processedUrl = URL.createObjectURL(blob);
      this.displayProcessedImage(processedUrl);
      this.downloadBtn.disabled = false;
      showToast('Image resized successfully!', 'success');
    } catch (error) {
      console.error('Error resizing image:', error);
      showToast('Failed to resize image. Please try again.', 'error');
    }
  }

  private displayProcessedImage(url: string): void {
    this.processedPreview.innerHTML = `
      <img src="${url}" alt="Resized" class="preview-image">
    `;
  }

  private downloadImage(): void {
    if (!this.processedImage) {
      return;
    }

    const url = URL.createObjectURL(this.processedImage);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resized-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Image downloaded!', 'success');
  }

  private clearImage(): void {
    if (this.originalImageUrl) {
      URL.revokeObjectURL(this.originalImageUrl);
    }

    this.originalImage = null;
    this.processedImage = null;
    this.originalImageUrl = null;

    this.imagePreviewContainer.classList.add('hidden');
    document.querySelector('#upload-zone')?.classList.remove('hidden');
    this.originalPreview.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i data-lucide="image"></i>
        </div>
      </div>
    `;
    this.processedPreview.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i data-lucide="image"></i>
        </div>
      </div>
    `;
    this.downloadBtn.disabled = true;
    this.applyBtn.disabled = true;
    this.fileInput.value = '';

    this.initIcons();
  }

  private applyTheme(theme: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// Initialize app
new App();

