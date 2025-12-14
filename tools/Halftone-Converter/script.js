let currentImageData = null;
        let currentSVG = null;

        // File upload handling
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const originalImg = document.getElementById('originalImg');
        const convertBtn = document.getElementById('convertBtn');
        const progress = document.getElementById('progress');
        const progressBar = document.getElementById('progressBar');
        const imageActions = document.getElementById('imageActions');

        // Slider synchronization
        const controls = [
            { slider: 'dotSizeSlider', input: 'dotSize' },
            { slider: 'spacingSlider', input: 'spacing' },
            { slider: 'contrastSlider', input: 'contrast' },
            { slider: 'thresholdSlider', input: 'threshold' }
        ];

        controls.forEach(({ slider, input }) => {
            const sliderEl = document.getElementById(slider);
            const inputEl = document.getElementById(input);
            
            sliderEl.addEventListener('input', () => {
                inputEl.value = sliderEl.value;
                if (currentImageData && !convertBtn.disabled) {
                    debounceConvert();
                }
            });
            
            inputEl.addEventListener('input', () => {
                sliderEl.value = inputEl.value;
                if (currentImageData && !convertBtn.disabled) {
                    debounceConvert();
                }
            });
        });

        // Debounced conversion for real-time updates
        let convertTimeout;
        function debounceConvert() {
            clearTimeout(convertTimeout);
            convertTimeout = setTimeout(convertToHalftone, 300);
        }

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        fileInput.addEventListener('change', handleFileSelect);

        function handleDragOver(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        }

        function handleDragLeave() {
            uploadArea.classList.remove('dragover');
        }

        function handleDrop(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        }

        function handleFileSelect(e) {
            const files = e.target.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        }

        function handleFile(file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                originalImg.src = e.target.result;
                originalImg.onload = function() {
                    // Hide upload area, show image and controls
                    uploadArea.style.display = 'none';
                    originalImg.style.display = 'block';
                    imageActions.style.display = 'flex';
                    convertBtn.disabled = false;
                    processImage();
                };
            };
            reader.readAsDataURL(file);
        }

        function changeImage() {
            fileInput.click();
        }

        function removeImage() {
            // Reset to initial state
            uploadArea.style.display = 'flex';
            originalImg.style.display = 'none';
            imageActions.style.display = 'none';
            convertBtn.disabled = true;
            
            // Clear SVG output
            const svgOutput = document.getElementById('svgOutput');
            const svgPlaceholder = document.getElementById('svgPlaceholder');
            const downloadBtn = document.getElementById('downloadBtn');
            
            svgOutput.style.display = 'none';
            svgPlaceholder.style.display = 'flex';
            downloadBtn.style.display = 'none';
            
            // Clear data
            currentImageData = null;
            currentSVG = null;
            fileInput.value = '';
        }

        function processImage() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Get original dimensions and calculate aspect ratio
            const originalWidth = originalImg.naturalWidth;
            const originalHeight = originalImg.naturalHeight;
            const aspectRatio = originalWidth / originalHeight;
            
            // Set canvas size for processing while maintaining aspect ratio
            const maxSize = 800;
            let canvasWidth, canvasHeight;
            
            if (originalWidth > originalHeight && originalWidth > maxSize) {
                canvasWidth = maxSize;
                canvasHeight = Math.round(maxSize / aspectRatio);
            } else if (originalHeight > maxSize) {
                canvasHeight = maxSize;
                canvasWidth = Math.round(maxSize * aspectRatio);
            } else {
                canvasWidth = originalWidth;
                canvasHeight = originalHeight;
            }
            
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            
            ctx.drawImage(originalImg, 0, 0, canvasWidth, canvasHeight);
            currentImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
            
            // Store dimensions and aspect ratio for SVG generation
            currentImageData.canvasWidth = canvasWidth;
            currentImageData.canvasHeight = canvasHeight;
            currentImageData.aspectRatio = aspectRatio;
        }

        function convertToHalftone() {
            if (!currentImageData) return;

            const dotSize = parseInt(document.getElementById('dotSize').value);
            const spacing = parseInt(document.getElementById('spacing').value);
            const contrast = parseFloat(document.getElementById('contrast').value);
            const threshold = parseInt(document.getElementById('threshold').value);

            progress.style.display = 'block';
            convertBtn.disabled = true;

            // Use setTimeout to allow UI to update
            setTimeout(() => {
                try {
                    const svg = generateHalftone(currentImageData, dotSize, spacing, contrast, threshold);
                    displaySVG(svg);
                    progress.style.display = 'none';
                    convertBtn.disabled = false;
                } catch (error) {
                    console.error('Conversion error:', error);
                    alert('An error occurred during conversion. Please try different settings.');
                    progress.style.display = 'none';
                    convertBtn.disabled = false;
                }
            }, 100);
        }

        function generateHalftone(imageData, dotSize, spacing, contrast, threshold) {
            const { width, height, data, canvasWidth, canvasHeight, aspectRatio } = imageData;
            
            // Create SVG with proper aspect ratio
            // Use the same dimensions as the canvas for the SVG to maintain aspect ratio
            const svgWidth = canvasWidth;
            const svgHeight = canvasHeight;
            
            let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg" style="background: white;">`;
            
            const totalDots = Math.ceil(width / spacing) * Math.ceil(height / spacing);
            let processedDots = 0;

            for (let y = 0; y < height; y += spacing) {
                for (let x = 0; x < width; x += spacing) {
                    // Sample area around the point
                    let totalBrightness = 0;
                    let sampleCount = 0;
                    
                    const sampleSize = Math.max(1, Math.floor(spacing / 2));
                    
                    for (let sy = y; sy < Math.min(y + sampleSize, height); sy++) {
                        for (let sx = x; sx < Math.min(x + sampleSize, width); sx++) {
                            const pixelIndex = (sy * width + sx) * 4;
                            const r = data[pixelIndex];
                            const g = data[pixelIndex + 1];
                            const b = data[pixelIndex + 2];
                            
                            // Calculate brightness
                            const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
                            totalBrightness += brightness;
                            sampleCount++;
                        }
                    }
                    
                    const avgBrightness = totalBrightness / sampleCount;
                    
                    // Apply contrast and threshold
                    const adjustedBrightness = Math.pow(avgBrightness / 255, 1 / contrast) * 255;
                    const normalizedBrightness = Math.max(0, Math.min(255, adjustedBrightness));
                    
                    if (normalizedBrightness < threshold) {
                        // Calculate dot radius based on darkness (inverted)
                        const darkness = (threshold - normalizedBrightness) / threshold;
                        const radius = Math.max(0.5, darkness * (dotSize / 2));
                        
                        const opacity = Math.max(0.1, Math.min(1, darkness * 1.2));
                        
                        svgContent += `<circle cx="${x + spacing/2}" cy="${y + spacing/2}" r="${radius}" fill="black" opacity="${opacity}"/>`;
                    }
                    
                    processedDots++;
                    if (processedDots % 100 === 0) {
                        const progress = (processedDots / totalDots) * 100;
                        progressBar.style.width = progress + '%';
                    }
                }
            }
            
            svgContent += '</svg>';
            progressBar.style.width = '100%';
            
            return svgContent;
        }

        function displaySVG(svgContent) {
            const svgOutput = document.getElementById('svgOutput');
            const svgPlaceholder = document.getElementById('svgPlaceholder');
            const downloadBtn = document.getElementById('downloadBtn');
            
            svgOutput.innerHTML = svgContent;
            svgOutput.style.display = 'flex';
            svgPlaceholder.style.display = 'none';
            downloadBtn.style.display = 'block';
            currentSVG = svgContent;
        }

        function downloadSVG() {
            if (!currentSVG) return;
            
            const blob = new Blob([currentSVG], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'halftone-artwork.svg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    