/*
 * Entry point AEM Author (crosswalk) injects into pages opened in the Universal Editor. The editor
 * support itself lives in ue/scripts/ue.js and is shared with da.live (*.ue.da.live); scripts.js
 * usually starts it before the page loads, so this call only forces AEM mode (richtext grouping)
 * and is otherwise a no-op.
 */
import ue from '../ue/scripts/ue.js';

ue({ aem: true });
