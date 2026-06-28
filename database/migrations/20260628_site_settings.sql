-- Site settings for public landing and institutional metadata.

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSON NOT NULL,
  updated_by INT UNSIGNED DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key),
  CONSTRAINT fk_site_settings_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO site_settings (setting_key, setting_value)
VALUES (
  'landing',
  JSON_OBJECT(
    'heroTitle', 'Asociacion Cafe Robusta OBC',
    'heroSubtitle', 'Impulsamos el desarrollo del cafe robusta con organizacion, conocimiento tecnico y vision productiva.',
    'heroImage', '/assets/landing-hero-v2.jpg',
    'metadata', JSON_ARRAY(
      JSON_OBJECT('label', 'Altitud Promedio', 'value', '0 - 800 msnm'),
      JSON_OBJECT('label', 'Precipitacion Anual', 'value', '2,000 - 3,000 mm'),
      JSON_OBJECT('label', 'Variedades', 'value', 'Coffea canephora'),
      JSON_OBJECT('label', 'Estandar de Calidad', 'value', 'OBC Premium')
    )
  )
)
ON DUPLICATE KEY UPDATE setting_key = setting_key;
