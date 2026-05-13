const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const dir = path.resolve(__dirname)
const files = ['extension.js', 'package.json', 'README.md', 'codex.png']

const LOCAL_FILE_HEADER = 0x04034b50
const CENTRAL_DIR_HEADER = 0x02014b50
const END_OF_CENTRAL_DIR = 0x06054b50

function crc32calc(buf) {
  const t = []
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = t[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function buildZip(entries) {
  const buffers = []
  let offset = 0
  const cdEntries = []

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8')
    const dataBuf = Buffer.from(entry.data)
    const crc = crc32calc(dataBuf)
    const compSize = dataBuf.length
    const uncompSize = dataBuf.length

    const header = Buffer.alloc(30 + nameBuf.length)
    header.writeUInt32LE(LOCAL_FILE_HEADER, 0)
    header.writeUInt16LE(20, 4)
    header.writeUInt16LE(0, 6)
    header.writeUInt16LE(0, 8)
    header.writeUInt16LE(0, 10)
    header.writeUInt16LE(0, 12)
    header.writeUInt32LE(crc, 14)
    header.writeUInt32LE(compSize, 18)
    header.writeUInt32LE(uncompSize, 22)
    header.writeUInt16LE(nameBuf.length, 26)
    header.writeUInt16LE(0, 28)
    nameBuf.copy(header, 30)

    buffers.push(header, dataBuf)
    cdEntries.push({ name: entry.name, offset, crc, compSize, uncompSize })
    offset += header.length + dataBuf.length
  }

  const cdStart = offset
  for (const ce of cdEntries) {
    const nameBuf = Buffer.from(ce.name, 'utf8')
    const h = Buffer.alloc(46 + nameBuf.length)
    h.writeUInt32LE(CENTRAL_DIR_HEADER, 0)
    h.writeUInt16LE(20, 4)
    h.writeUInt16LE(20, 6)
    h.writeUInt16LE(0, 8)
    h.writeUInt16LE(0, 10)
    h.writeUInt16LE(0, 12)
    h.writeUInt32LE(ce.crc, 16)
    h.writeUInt32LE(ce.compSize, 20)
    h.writeUInt32LE(ce.uncompSize, 24)
    h.writeUInt16LE(nameBuf.length, 28)
    h.writeUInt16LE(0, 30)
    h.writeUInt16LE(0, 32)
    h.writeUInt16LE(0, 34)
    h.writeUInt32LE(0, 36)
    h.writeUInt32LE(32, 40)
    h.writeUInt32LE(ce.offset, 42)
    nameBuf.copy(h, 46)
    buffers.push(h)
    offset += h.length
  }

  const eo = Buffer.alloc(22)
  eo.writeUInt32LE(END_OF_CENTRAL_DIR, 0)
  eo.writeUInt16LE(0, 4)
  eo.writeUInt16LE(0, 6)
  eo.writeUInt16LE(cdEntries.length, 8)
  eo.writeUInt16LE(cdEntries.length, 10)
  eo.writeUInt32LE(offset - cdStart, 12)
  eo.writeUInt32LE(cdStart, 16)
  eo.writeUInt16LE(0, 20)
  buffers.push(eo)

  return Buffer.concat(buffers)
}

const contentTypes = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="manifest" ContentType="text/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="js" ContentType="application/javascript"/>
  <Default Extension="json" ContentType="application/json"/>
  <Default Extension="md" ContentType="text/markdown"/>
</Types>`

const manifest = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011">
  <Metadata>
    <Identity Id="classy-handbook-launcher" Version="0.1.0" Language="en-US" Publisher="sentra-local"/>
    <DisplayName>Classy Handbook Launcher</DisplayName>
    <Description>Status bar launcher for Classy handbook documents - dynamic palette from docs/handbook/</Description>
  </Metadata>
  <Installation Scope="User">
    <ProductProductId>Microsoft.VisualStudio.Code</ProductProductId>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.VsPackage" d:Source="File" Path="extension.vsixmanifest" d:VsixSubPath=""/>
  </Assets>
</PackageManifest>`

const container = `<?xml version="1.0" encoding="utf-8"?>
<Container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <RootFiles>
    <RootFile FullName="extension.vsixmanifest" MediaType="application/vnd.openxmlformats-package.relationships+xml"/>
  </RootFiles>
</Container>`

const entries = [
  { name: '[Content_Types].xml', data: contentTypes },
  { name: 'extension.vsixmanifest', data: manifest },
  { name: 'META-INF/container.xml', data: container },
]

for (const fname of files) {
  const fpath = path.join(dir, fname)
  if (fs.existsSync(fpath)) {
    entries.push({ name: fname, data: fs.readFileSync(fpath) })
  }
}

const vsixPath = path.join(dir, 'classy-handbook-launcher-0.1.0.vsix')
fs.writeFileSync(vsixPath, buildZip(entries))
console.log('VSIX created: ' + vsixPath + ' (' + fs.statSync(vsixPath).size + ' bytes)')
fs.unlinkSync(path.join(dir, 'build_vsix.py'))
console.log('Cleaned up build_vsix.py')
