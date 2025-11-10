# راهنمای استفاده از حالت‌های لوکال برای حفظ امنیت داده‌ها

## مقدمه
این راهنما روش‌های مختلفی را برای اجرای سیستم RAG به صورت کاملاً لوکال و بدون نیاز به سرویس‌های خارجی معرفی می‌کند تا امنیت داده‌ها به حداکثر برسد.

## روش‌های موجود

### 1. حالت کاملاً لوکال (Local Mode) - پیشنهادی
**مزایا:**
- ✅ بدون نیاز به هیچ سرویس خارجی
- ✅ امنیت داده‌ها در بالاترین سطح
- ✅ اجرای سریع و بدون وابستگی
- ✅ مناسب برای تست و توسعه

**معایب:**
- ❌ محدودیت در حجم داده‌ها (حداکثر 10,000 سند)
- ❌ عملکرد پایین‌تر در حجم‌های زیاد

**نحوه فعالسازی:**
```typescript
// در فایل api.ts یا جایی که retrievalService استفاده می‌شود
import { retrievalService } from './services/retrievalServiceNew';

// به صورت پیش‌فرض حالت local فعال است
// نیازی به تغییر خاصی نیست
```

### 2. حالت Qdrant لوکال (Qdrant Local Mode)
**مزایا:**
- ✅ بدون نیاز به Docker یا سرور خارجی
- ✅ استفاده از قدرت Qdrant به صورت لوکال
- ✅ پشتیبانی کامل از sparse vectors
- ✅ مناسب برای داده‌های متوسط

**معایب:**
- ❌ نیاز به نصب @qdrant/js-client-rest
- ❌ مصرف حافظه بیشتر

**نحوه فعالسازی:**
```typescript
import { RetrievalService } from './services/retrievalServiceNew';

const retrievalService = new RetrievalService('qdrant-local');
await retrievalService.initialize();
```

### 3. حالت Qdrant سرور (Qdrant Server Mode)
**مزایا:**
- ✅ عملکرد بالا برای حجم‌های زیاد داده
- ✅ قابلیت‌های پیشرفته Qdrant
- ✅ مناسب برای تولید

**معایب:**
- ❌ نیاز به Docker یا Qdrant Cloud
- ❌ امنیت پایین‌تر (داده‌ها در خارج نگهداری می‌شوند)

## مقایسه عملکرد

| روش | حداکثر داده‌ها | سرعت جستجو | امنیت داده‌ها | نیاز به اینترنت |
|-----|----------------|-------------|---------------|------------------|
| Local | 10K سند | سریع | ★★★★★ | خیر |
| Qdrant Local | 100K سند | خیلی سریع | ★★★★☆ | خیر |
| Qdrant Server | نامحدود | بسیار سریع | ★★★☆☆ | بله |

## تنظیمات امنیتی پیشنهادی

### 1. استفاده از حالت لوکال
```typescript
// در فایل .env.local
VECTOR_STORAGE_MODE=local
```

### 2. محدود کردن حافظه
```typescript
// در localVectorService.ts
private maxDocuments = 5000; // کاهش حداکثر اسناد
```

### 3. رمزنگاری داده‌های حساس
```typescript
// اضافه کردن رمزنگاری برای داده‌های حساس
import crypto from 'crypto';

const encrypt = (text: string, key: string) => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
};
```

## تست سیستم

برای تست سیستم در حالت لوکال:

```bash
# تست حالت لوکال
npm run dev

# در ترمینال دیگر
python test_system.py
```

## نکات مهم امنیتی

1. **همیشه از حالت لوکال برای داده‌های حساس استفاده کنید**
2. **داده‌ها فقط در حافظه RAM نگهداری می‌شوند و بعد از ری‌استارت برنامه حذف می‌شوند**
3. **برای داده‌های بلندمدت، نسخه پشتیبان تهیه کنید**
4. **دسترسی به فایل‌های سیستم را محدود کنید**

## عیب‌یابی

### مشکل: حافظه پر می‌شود
**راه‌حل:**
```typescript
// کاهش حداکثر اسناد
private maxDocuments = 1000;

// یا افزودن مکانیزم حذف خودکار
private cleanupOldDocuments(): void {
  const docsToRemove = this.documentStore.size - this.maxDocuments;
  if (docsToRemove > 0) {
    const keysToRemove = Array.from(this.documentStore.keys()).slice(0, docsToRemove);
    keysToRemove.forEach(key => {
      this.documentStore.delete(key);
      this.vectorIndex.delete(key);
    });
  }
}
```

### مشکل: سرعت جستجو پایین است
**راه‌حل:**
- استفاده از Web Workers برای پردازش موازی
- کاهش ابعاد بردارها
- استفاده از ایندکس‌سازی ساده‌تر

## جمع‌بندی

برای حفظ حداکثر امنیت داده‌ها، **حالت لوکال (Local Mode)** را پیشنهاد می‌کنم. این حالت بدون نیاز به هیچ وابستگی خارجی کار می‌کند و تمام داده‌ها فقط در حافظه RAM نگهداری می‌شوند.