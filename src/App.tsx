import React, { useState } from "react";

/**
 * Diss-TDF Entscheidungsunterstützung (Prototyp)
 *
 * Zielgruppe: Ärzt:innen / Therapeut:innen
 * Funktion:
 *  - 4 Dimensionen des Dissociation – Therapeutic Decision Framework (Diss-TDF)
 *  - Jede Dimension wird per Likert-Skala (1–5) eingeschätzt
 *  - Am Ende werden für jede Dimension:
 *      - fein abgestufte Einordnung (klar/eher/gemischt)
 *      - empfohlene therapeutische Schwerpunkte (auf Basis des Pols)
 *      - nicht empfohlene Vorgehensweisen
 *    angezeigt sowie eine aggregierte Übersicht der empfohlenen Methoden.
 *
 * Hinweis: Prototyp, ersetzt keine klinische Entscheidung.
 */

/* ---------- Typen ---------- */

type ItemType = "likert";

type Item = {
  id: string;
  label: string;
  type: ItemType;
  scale: number[];
};

type Dimension = {
  id: "beginn" | "semiologie" | "verlauf" | "symptomwahrn";
  label: string;
  description: string;
  items: Item[];
};

type PoleId = "left" | "middle" | "right";

type PoleInfo = {
  name: string; // z. B. "somatoform" oder "nach Akuttrauma"
  headline: string; // z. B. "Überwiegend somatoforme Symptomatik"
  recommended: string[];
  avoid: string[];
};

type DimensionRecommendationConfig = {
  left: PoleInfo;
  middle: PoleInfo;
  right: PoleInfo;
};

type DimensionResult = {
  dimension: Dimension;
  pole: PoleInfo;
  rawValue: number; // 1–5 aus der Skala
};

type AggregatedMethod = {
  label: string;
  sources: string[]; // aus welchen Dimensionen kommt diese Empfehlung?
};

/* ---------- Dimensionen ---------- */

const DIMENSIONS: Dimension[] = [
  {
    id: "beginn",
    label: "Dimension 1: Beginn",
    description: "Kontinuum von „unprovoziert“ bis „nach akuttraumatischem Ereignis“",
    items: [
      {
        id: "beginn_skala",
        label: "Beginn: unprovoziert (1) – nach Akuttrauma (5)",
        type: "likert",
        scale: [1, 2, 3, 4, 5]
      }
    ]
  },
  {
    id: "semiologie",
    label: "Dimension 2: Semiologie",
    description: "Kontinuum von „somatoform“ bis „psychoform“",
    items: [
      {
        id: "semiologie_skala",
        label: "Semiologie: somatoform (1) – psychoform (5)",
        type: "likert",
        scale: [1, 2, 3, 4, 5]
      }
    ]
  },
  {
    id: "verlauf",
    label: "Dimension 3: Verlauf",
    description: "Kontinuum von „anhaltend“ bis „anfallsartig“",
    items: [
      {
        id: "verlauf_skala",
        label: "Verlauf: anhaltend (1) – anfallsartig (5)",
        type: "likert",
        scale: [1, 2, 3, 4, 5]
      }
    ]
  },
  {
    id: "symptomwahrn",
    label: "Dimension 4: Symptomwahrnehmung",
    description: "Kontinuum von integrierter zu desintegrierter Symptomwahrnehmung",
    items: [
      {
        id: "symptomwahrn_skala",
        label: "Symptomwahrnehmung: integriert (1) – desintegriert (5)",
        type: "likert",
        scale: [1, 2, 3, 4, 5]
      }
    ]
  }
];

/* ---------- Entscheidungstabellen je Dimension (Pol-basiert) ---------- */

const CONFIG: Record<Dimension["id"], DimensionRecommendationConfig> = {
  beginn: {
    left: {
      name: "unprovoziert / nicht klar traumaassoziiert",
      headline: "Beginn eher unprovoziert",
      recommended: [
        "Exploration der Symptomgeschichte und Bedeutung",
        "Zulassende Haltung gegenüber der Dissoziation (Flucht-ins-Symptom begrenzen, aber nicht pathologisieren)",
        "Aufbau eines therapeutischen Rahmens, der auch ohne klares Trauma Sinn macht"
      ],
      avoid: [
        "Katastrophisierende Botschaften („darf nicht passieren, weil gefährlich“)",
        "Ausschließliches Suchen nach einem konkreten Trauma als Zugangsvoraussetzung für Therapie"
      ]
    },
    middle: {
      name: "unklar / gemischt",
      headline: "Beginn unklar oder gemischt",
      recommended: [
        "Offene Exploration von Belastungsfaktoren (akut und biografisch)",
        "Behutsame Psychoedukation zu Stress- und Traumafolgen",
        "Flexibles Anpassen zwischen Stabilisierung und Exploration"
      ],
      avoid: [
        "Zu frühe Festlegung auf rein psychogene oder rein somatische Erklärungsmuster"
      ]
    },
    right: {
      name: "unmittelbar nach akuttraumatischem Ereignis",
      headline: "Beginn eher nach Akuttrauma",
      recommended: [
        "Stabilisierung im Vordergrund (Ressourcen, Sicherung, Affektregulation)",
        "Arbeit an Alltagssicherheit und Symptommanagement vor Traumaexposition",
        "Behutsame Traumabearbeitung erst nach ausreichender Stabilisierung"
      ],
      avoid: [
        "Direkte Konfrontation mit der Dissoziation („muss unbedingt durchgearbeitet werden“)",
        "Überfordernde Expositionen ohne ausreichende Stabilisierung"
      ]
    }
  },
  semiologie: {
    left: {
      name: "somatoform",
      headline: "Überwiegend somatoforme Symptomatik",
      recommended: [
        "Aktives Arbeiten mit dem Körpersymptom (Fokus auf Funktion des Körpers)",
        "Einbezug von Physiotherapie / manueller Therapie / körpertherapeutischen Verfahren",
        "Förderung von Aktivität statt Schonung"
      ],
      avoid: [
        "Frühe Psychologisierung oder Infragestellen der „Echtheit“ der Symptome",
        "Einseitige Betonung von Einschränkung und Schonung"
      ]
    },
    middle: {
      name: "gemischt somato-/psychoform",
      headline: "Gemischte somatoforme und psychoforme Symptomatik",
      recommended: [
        "Kombination aus körperbezogener und beziehungsorientierter Arbeit",
        "Psychoedukation über Zusammenhänge zwischen Körper, Emotion und Beziehung",
        "Flexibles Wechseln zwischen Körperfokus und Beziehung/Innerem Erleben"
      ],
      avoid: [
        "Einseitige Fokussierung nur auf Körper oder nur auf Psyche"
      ]
    },
    right: {
      name: "psychoform",
      headline: "Überwiegend psychoforme Symptomatik",
      recommended: [
        "Feinfühliges Arbeiten an der therapeutischen Beziehung",
        "Fokus auf In-Kontakt-Bleiben und gemeinsame Affektregulation",
        "Mentalisieren, Benennen und Einordnen innerer Zustände"
      ],
      avoid: [
        "Sehr aktivierende und/oder stark fordernde Übungen",
        "Zu viel psychoedukativer Input in kurzer Zeit"
      ]
    }
  },
  verlauf: {
    left: {
      name: "anhaltend",
      headline: "Überwiegend anhaltender Verlauf",
      recommended: [
        "Aktivierende körperbezogene Arbeit (unter Einbezug von Physiotherapie, manueller Therapie etc.)",
        "Förderung funktionsorientierter Aktivität im Alltag",
        "Aufbau von langfristigen Bewältigungsstrategien bei Dauerbelastung"
      ],
      avoid: [
        "Zu restriktive oder schonende Ansätze mit übermäßiger Betonung der körperlichen Einschränkung (Schonhaltung)",
        "Reine Passivierung ohne aktive Beteiligung der Patient:in"
      ]
    },
    middle: {
      name: "gemischt / wechselnd",
      headline: "Gemischter Verlauf (anhaltend und anfallsartig)",
      recommended: [
        "Kombination: Aktivierende körperbezogene Arbeit für anhaltende Komponenten",
        "Triggerbezogene Arbeit für anfallsartige Episoden",
        "Anpassung des Tempos je nach aktueller Symptomlage"
      ],
      avoid: [
        "Ignorieren einer der beiden Komponenten (nur Anfälle oder nur Dauerbelastung berücksichtigen)"
      ]
    },
    right: {
      name: "anfallsartig",
      headline: "Überwiegend anfallsartige Symptomatik",
      recommended: [
        "Trigger-bezogene Arbeit an Auslösern der Attacken (körperliche und psychologische Trigger)",
        "Aufbau von Frühwarnzeichen- und Krisenplänen",
        "Arbeit an Sicherheit und Kontrollgefühl zwischen den Anfällen"
      ],
      avoid: [
        "Vermeidungsorientierte Triggerarbeit mit übermäßiger Betonung von Gefahren (Gefahr der Trigger-Verstärkung)",
        "Dauerhafte Überwachung/„Hypervigilanz“ ohne Ressourcenfokus"
      ]
    }
  },
  symptomwahrn: {
    left: {
      name: "eher integrierte Symptomwahrnehmung",
      headline: "Überwiegend integrierte Symptomwahrnehmung",
      recommended: [
        "Explorative und einsichtsorientierte Therapie (z. B. psychodynamisch, kognitiv, mentalisierungsorientiert)",
        "Arbeit mit Narrativen: Einbettung der Symptome in eine persönliche Krankheitsgeschichte",
        "Psychoedukation, die an vorhandene Selbstreflexion anknüpft"
      ],
      avoid: [
        "Übermäßige Strukturierung, wenn bereits gute Reflexionsfähigkeit besteht"
      ]
    },
    middle: {
      name: "teils integriert, teils desintegriert",
      headline: "Gemischte Symptomwahrnehmung",
      recommended: [
        "Abwechselnd strukturaufbauende und explorative Elemente",
        "Fokussierung auf Bereiche, in denen Integration schon möglich ist",
        "Behutsame Erweiterung des Verstehens ohne Überforderung"
      ],
      avoid: [
        "Zu schnelle Konfrontation mit sehr desintegrierten Anteilen"
      ]
    },
    right: {
      name: "eher desintegrierte Symptomwahrnehmung",
      headline: "Überwiegend desintegrierte Symptomwahrnehmung",
      recommended: [
        "Strukturaufbauende, ich-stärkende Therapie",
        "Fokus auf Affektwahrnehmung und -regulation (ohne Überflutung)",
        "Arbeit an der Verknüpfung von Körperempfinden, Emotion und Kognition in kleinen Schritten"
      ],
      avoid: [
        "Überfordernde konfrontative Verfahren",
        "Zu frühe, abstrakte Deutungen ohne ausreichende Ich-Stützung"
      ]
    }
  }
};

/* ---------- Auswertung ---------- */

function classifyPole(value: number): PoleId {
  if (value <= 2) return "left";   // 1 & 2 = linker Pol (unterscheiden wir im Text)
  if (value >= 4) return "right";  // 4 & 5 = rechter Pol
  return "middle";                 // 3 = Mitte
}

// Feinere verbale Einordnung je Dimension und Wert (Option A)
function getFineGrainedLabel(dimId: Dimension["id"], value: number, fallback: string): string {
  if (!value || value < 1 || value > 5) return fallback;

  if (dimId === "semiologie") {
    if (value === 1) return "Klar somatoforme Symptomatik";
    if (value === 2) return "Eher somatoforme Symptomatik";
    if (value === 3) return "Gemischt somato- und psychoform";
    if (value === 4) return "Eher psychoforme Symptomatik";
    return "Klar psychoforme Symptomatik"; // 5
  }

  if (dimId === "beginn") {
    if (value === 1) return "Klar unprovozierter Beginn";
    if (value === 2) return "Eher unprovozierter Beginn";
    if (value === 3) return "Beginn unklar oder gemischt";
    if (value === 4) return "Eher Beginn nach akuttraumatischem Ereignis";
    return "Klar Beginn nach akuttraumatischem Ereignis";
  }

  if (dimId === "verlauf") {
    if (value === 1) return "Klar anhaltender Verlauf";
    if (value === 2) return "Eher anhaltender Verlauf";
    if (value === 3) return "Gemischt: anhaltend und anfallsartig";
    if (value === 4) return "Eher anfallsartiger Verlauf";
    return "Klar anfallsartiger Verlauf";
  }

  if (dimId === "symptomwahrn") {
    if (value === 1) return "Klar integrierte Symptomwahrnehmung";
    if (value === 2) return "Eher integrierte Symptomwahrnehmung";
    if (value === 3) return "Teils integrierte, teils desintegrierte Symptomwahrnehmung";
    if (value === 4) return "Eher desintegrierte Symptomwahrnehmung";
    return "Klar desintegrierte Symptomwahrnehmung";
  }

  return fallback;
}

function evaluate(values: Record<string, number>): {
  perDimension: DimensionResult[];
  aggregated: AggregatedMethod[];
} {
  const perDimension: DimensionResult[] = [];

  for (const dim of DIMENSIONS) {
    const item = dim.items[0];
    const raw = Number(values[item.id] || 0);
    if (!raw) continue;

    const poleId = classifyPole(raw);
    const poleInfo = CONFIG[dim.id][poleId];

    perDimension.push({ dimension: dim, pole: poleInfo, rawValue: raw });
  }

  // Aggregation der empfohlenen Methoden (Pol-basiert)
  const map: Record<string, AggregatedMethod> = {};

  for (const res of perDimension) {
    res.pole.recommended.forEach((m) => {
      if (!map[m]) {
        map[m] = { label: m, sources: [res.dimension.label] };
      } else if (!map[m].sources.includes(res.dimension.label)) {
        map[m].sources.push(res.dimension.label);
      }
    });
  }

  const aggregated = Object.values(map).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return { perDimension, aggregated };
}

/* ---------- UI ---------- */

const containerStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: "24px auto",
  padding: 16,
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  color: "#123"
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 1px 8px rgba(15, 35, 80, 0.08)",
  marginBottom: 16
};

export default function App() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentDim = DIMENSIONS[step];

  const totalSteps = DIMENSIONS.length;

  const handleSelect = (itemId: string, value: number) => {
    setValues((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const reset = () => {
    setValues({});
    setStep(0);
    setShowResult(false);
  };

  const { perDimension, aggregated } = showResult
    ? evaluate(values)
    : { perDimension: [], aggregated: [] };

  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, color: "#0b5394", margin: 0 }}>
          Diss-TDF – Entscheidungsunterstützung (Prototyp)
        </h1>
        <p style={{ marginTop: 6, color: "#456" }}>
          Behandelnde Person schätzt die vier Dimensionen auf einer Skala ein.
          Anschließend werden passende therapeutische Schwerpunkte vorgeschlagen.
        </p>
      </header>

      {!showResult && (
        <>
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                height: 8,
                borderRadius: 999,
                background: "#e4edf9",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${((step + 1) / totalSteps) * 100}%`,
                  height: "100%",
                  background: "#7da7e6"
                }}
              />
            </div>
            <small style={{ color: "#567" }}>
              Schritt {step + 1} von {totalSteps}
            </small>
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>{currentDim.label}</h2>
            <p style={{ color: "#567", marginTop: 0 }}>
              {currentDim.description}
            </p>

            {currentDim.items.map((item) => (
              <div key={item.id} style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  {item.label}
                </div>
                <div>
                  {item.scale.map((val) => (
                    <button
                      key={val}
                      onClick={() => handleSelect(item.id, val)}
                      style={{
                        padding: "8px 12px",
                        marginRight: 8,
                        marginBottom: 6,
                        borderRadius: 999,
                        border:
                          values[item.id] === val
                            ? "2px solid #2b6cb0"
                            : "1px solid #c8d9f2",
                        background:
                          values[item.id] === val ? "#e6f0ff" : "#ffffff",
                        cursor: "pointer"
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
                  {values[item.id]
                    ? `Auswahl: ${values[item.id]} – ${
                        getFineGrainedLabel(
                          currentDim.id,
                          values[item.id],
                          "Einordnung folgt"
                        )
                      }`
                    : "Noch keine Auswahl (1 = klar linker Pol, 5 = klar rechter Pol)"}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8
            }}
          >
            <div>
              <button
                onClick={handlePrev}
                disabled={step === 0}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5f0",
                  background: step === 0 ? "#f5f7fb" : "#ffffff",
                  cursor: step === 0 ? "default" : "pointer",
                  marginRight: 8
                }}
              >
                Zurück
              </button>
              <button
                onClick={handleNext}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2b6cb0",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                {step < totalSteps - 1
                  ? "Weiter"
                  : "Empfehlung anzeigen"}
              </button>
            </div>
          </div>
        </>
      )}

      {showResult && (
        <div style={{ marginTop: 8 }}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Übergeordnete Empfehlungen</h2>
            {aggregated.length === 0 ? (
              <p style={{ color: "#555" }}>
                Es liegen noch nicht genügend Angaben vor, um Empfehlungen
                abzuleiten.
              </p>
            ) : (
              <>
                <p style={{ color: "#555" }}>
                  Folgende therapeutische Schwerpunkte ergeben sich aus der
                  Kombination der vier Dimensionen:
                </p>
                <ul>
                  {aggregated.map((m) => (
                    <li key={m.label} style={{ marginBottom: 4 }}>
                      <strong>{m.label}</strong>{" "}
                      <span style={{ fontSize: 12, color: "#777" }}>
                        (abgeleitet aus: {m.sources.join(", ")})
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {perDimension.map((res) => (
            <div key={res.dimension.id} style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>{res.dimension.label}</h3>
              <p style={{ marginBottom: 4, color: "#345" }}>
                <strong>Einordnung:</strong>{" "}
                {getFineGrainedLabel(
                  res.dimension.id,
                  res.rawValue,
                  res.pole.headline
                )}{" "}
                ({res.pole.name}, Wert: {res.rawValue}/5)
              </p>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    Empfohlen:
                  </div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {res.pole.recommended.map((r) => (
                      <li key={r} style={{ marginBottom: 2 }}>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    Nicht empfohlen:
                  </div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {res.pole.avoid.map((a) => (
                      <li key={a} style={{ marginBottom: 2 }}>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <button
              onClick={reset}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5f0",
                background: "#ffffff",
                cursor: "pointer"
              }}
            >
              Neue Einschätzung starten
            </button>
          </div>
        </div>
      )}

      <footer style={{ marginTop: 16, fontSize: 12, color: "#789" }}>
        Prototyp basierend auf dem „Dissociation – Therapeutic Decision
        Framework“ (Diss-TDF). Endgültige klinische Entscheidungen verbleiben
        bei der behandelnden Person.
      </footer>
    </div>
  );
}
