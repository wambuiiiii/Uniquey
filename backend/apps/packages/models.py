from django.db import models
import uuid

# Create your models here.
class Package(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(
        max_length=255
    )
    tagline = models.CharField(max_length=255, blank=True, default="")
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    hero_image = models.ImageField(upload_to='packages/', blank=True, null=True)
    starting_price = models.DecimalField(max_digits=10, decimal_places=2)
    active = models.BooleanField(default=True)
    audience = models.JSONField(default=list, blank=True)
    included = models.JSONField(default=list, blank=True)
    addons = models.JSONField(default=list, blank=True)
    faqs = models.JSONField(default=list, blank=True)
    seo_title = models.CharField(max_length=255, blank=True)
    meta_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name