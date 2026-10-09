from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('vuln', '0001_initial')]

    operations = [
        migrations.CreateModel(
            name='Secret',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.CharField(max_length=128)),
            ],
        ),
    ]
