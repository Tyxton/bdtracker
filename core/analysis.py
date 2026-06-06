import json
import sqlite3
from datetime import datetime
from typing import List
from db.schemas import MindLogEntryOut

def process_timeline_phases(db_rows: List[sqlite3.Row]) -> List[MindLogEntryOut]:
    """
    Processes raw SQLite records into strongly-typed tracking arrays. 
    """
    raw_timeline = []
    for row in db_rows:
        raw_ts = row["timestamp"]
        
        try:
            dt_obj = datetime.strptime(raw_ts, "%Y-%m-%d %H:%M:%S")
            date_formatted = dt_obj.strftime("%m-%d %H:%M")
            display_ts = dt_obj.strftime("%Y-%m-%d %H:%M")
        except ValueError:
            date_formatted = raw_ts
            display_ts = raw_ts

        journal_str = row["journal_text"]
        has_journal = bool(journal_str and journal_str.strip())
        snippet = journal_str if has_journal else None

        tags_raw = row["trigger_tags"]
        parsed_tags = []
        if tags_raw:
            try:
                parsed_tags = json.loads(tags_raw)
            except Exception:
                parsed_tags = [t.strip() for t in tags_raw.split(",") if t.strip()]

        entry_data = MindLogEntryOut(
            timestamp=display_ts,
            date_formatted=date_formatted,
            mood=row["mood"],
            energy=row["energy"],
            has_journal=has_journal,
            journal_snippet=snippet,
            trigger_tags=parsed_tags,
            is_mixed_state=False
        )
        raw_timeline.append(entry_data)

    processed_timeline = []
    in_depressive_phase = False
    in_hypomanic_phase = False
    in_mixed_phase = False

    for i, entry in enumerate(raw_timeline):
        m = entry.mood
        e = entry.energy

        # Mixed state logic
        if m is not None and e is not None:
            if m <= 4 and e >= 7:
                in_mixed_phase = True
            elif in_mixed_phase and (m >= 6 or e <= 5):
                in_mixed_phase = False
        
        # Depressive state logic
        if m is not None and e is not None and not in_mixed_phase:
            if m <= 3 and e <= 3:
                in_depressive_phase = True
            elif in_depressive_phase and (m >= 5 or e >= 5):
                in_depressive_phase = False
        else:
            if in_mixed_phase:
                in_depressive_phase = False

        # Hypomanic state logic
        if m is not None and e is not None and not in_mixed_phase:
            if m >= 8 and e >= 8:
                in_hypomanic_phase = True
            elif in_hypomanic_phase and (m <= 6 or e <= 6):
                in_hypomanic_phase = False
        else:
            if in_mixed_phase:
                in_hypomanic_phase = False

        # Phase tracking for omitted or empty metrics updates
        if m is None or e is None:
            has_prior_phase = i > 0 and (processed_timeline[i-1].is_mixed_state or (processed_timeline[i-1].mood and processed_timeline[i-1].mood <= 3))
            if has_prior_phase and i < len(raw_timeline) - 1:
                next_entry = raw_timeline[i+1]
                if next_entry.is_mixed_state or (next_entry.mood and next_entry.mood <= 4):
                    entry.is_mixed_state = processed_timeline[i-1].is_mixed_state

        if in_mixed_phase:
            entry.is_mixed_state = True
        if in_depressive_phase:
            entry.is_depressive_state = True
        if in_hypomanic_phase:
            entry.is_hypomanic_state = True
        
        processed_timeline.append(entry)

    return processed_timeline
