/** Download or share a grocery photo (works on mobile — Share → Save Image). */
export async function downloadGroceryImage(imageUrl, filename = 'grocery-photo.jpg') {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error('Could not load image');
  const blob = await res.blob();
  const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
  const name = filename.includes('.') ? filename : `${filename}.${ext}`;
  const file = new File([blob], name, { type: blob.type || 'image/jpeg' });

  // Mobile: system share sheet → Save to Photos / Files
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Grocery photo' });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Save all images for an order (one share/download at a time on mobile). */
export async function downloadAllOrderImages(orderId, images) {
  for (let i = 0; i < images.length; i += 1) {
    await downloadGroceryImage(images[i], `order-${orderId}-grocery-${i + 1}`);
  }
}
