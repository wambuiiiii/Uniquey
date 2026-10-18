import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize the Celery application
app = Celery('uniquey')

# Use a string here to prevent the worker from serializing
# the configuration object to child processes.
# Namespace='CELERY' means all celery-related configuration keys
# should have a `CELERY_` prefix in base.py.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Automatically discover tasks.py files in all installed Django apps.
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')